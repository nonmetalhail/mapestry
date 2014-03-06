from flask import Flask, make_response, flash, request, render_template, redirect, url_for
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound #, MultipleResultsFound
import json, datetime, sys

from flask.ext.login import LoginManager, login_user, logout_user, login_required
import hashlib
from os import urandom, path
from base64 import b64encode, b64decode
from itertools import izip

from flask.ext.uploads import UploadSet, IMAGES, AUDIO, configure_uploads  #http://pythonhosted.org/Flask-Uploads/

# From https://github.com/mitsuhiko/python-pbkdf2
from pbkdf2 import pbkdf2_bin

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/mapestry.db'
app.config['SECRET_KEY'] = '12345'
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)

#
# Password Hashing
#

# Parameters to PBKDF2. Only affect new passwords.
SALT_LENGTH = 12
KEY_LENGTH = 24
HASH_FUNCTION = 'sha256'  # Must be in hashlib.
# Linear to the hashing time. Adjust to be high but take a reasonable
# amount of time on your server. Measure with:
# python -m timeit -s 'import passwords as p' 'p.make_hash("something")'
COST_FACTOR = 10000


def make_hash(password):
    """Generate a random salt and return a new hash for the password."""
    if isinstance(password, unicode):
        password = password.encode('utf-8')
    salt = b64encode(urandom(SALT_LENGTH))
    return 'PBKDF2${}${}${}${}'.format(
        HASH_FUNCTION,
        COST_FACTOR,
        salt,
        b64encode(pbkdf2_bin(password, salt, COST_FACTOR, KEY_LENGTH,
                             getattr(hashlib, HASH_FUNCTION))))


def check_hash(password, hash_):
    """Check a password against an existing hash."""
    if isinstance(password, unicode):
        password = password.encode('utf-8')
    algorithm, hash_function, cost_factor, salt, hash_a = hash_.split('$')
    assert algorithm == 'PBKDF2'
    hash_a = b64decode(hash_a)
    hash_b = pbkdf2_bin(password, salt, int(cost_factor), len(hash_a),
                        getattr(hashlib, hash_function))
    assert len(hash_a) == len(hash_b)  # we requested this from pbkdf2_bin()
    # Same as "return hash_a == hash_b" but takes a constant time.
    # See http://carlos.bueno.org/2011/10/timing.html
    diff = 0
    for char_a, char_b in izip(hash_a, hash_b):
        diff |= ord(char_a) ^ ord(char_b)
    return diff == 0


#
# Models
#

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120))
    password = db.Column(db.String(64))

    def __init__(self, email, password):
        self.email = email
        self.password = make_hash(password)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)

    def __repr__(self):
        return '<User %r>' % self.email

    def __unicode__(self):
        return unicode(self.email)

story_tags_table = db.Table('story_tags', db.Model.metadata,
                           db.Column('story_id', db.Integer, db.ForeignKey('stories.id')),
                           db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'))
                           )

class Story(db.Model):
    __tablename__ = 'stories'
    id = db.Column(db.Integer, primary_key=True)
    story = db.Column(db.String(80), unique=True)  #is this one necessary or is id sufficient going forward?
    audio = db.Column(db.String(80), unique=True)
    title = db.Column(db.String(80), unique=True)
    date = db.Column(db.Date)
    text = db.Column(db.Text, unique=True)
    segments = db.relationship('Segment', back_populates="story")

    def __init__(self, story, audio, title, date, text, tags):
        self.story = story
        self.audio = audio
        self.title = title
        self.date = date
        self.text = text
        if isinstance(tags, basestring):
            tags = [tags]
        self.tags = [
            Tag(tag_text) for tag_text in tags
            ]

    def __repr__(self):
        return '<Story %r>' % self.title


class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    tag_text = db.Column(db.String(80))
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'))
    story = db.relationship('Story', secondary='story_tags', backref=db.backref('tags'))

    def __init__(self, tag_text):
        self.tag_text = tag_text
        #self.story = story

    def __repr(self):
        return '<Tag %r>' % self.tag_text


class Photo(db.Model):
    __tablename__ = 'photos'
    id = db.Column(db.String(32), primary_key=True) #md5
    image = db.Column(db.String(80), unique=True)
    name = db.Column(db.String(80), unique=True)
    date = db.Column(db.Date)  #db.DateTime, default=datetime.datetime.now)
    description = db.Column(db.String(256))
    stories = db.Column(db.String(256))
    share = db.Column(db.String(80))  #Boolean?  then use: "Public" if p.share else "Private"


    def __init__(self, image, name, date, description, stories, share):
        md5 = hashlib.md5()
        md5.update(image)
        self.id = md5.hexdigest()
        self.image = image
        self.name = name
        self.date = date
        self.description = description
        self.stories = stories
        self.share = share

    def __repr__(self):
       return '<Photo %r>' % self.name


class Audio(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    audio = db.Column(db.String(80), unique=True)
    name = db.Column(db.String(80), unique=True)

    def __init__(self, audio, name):
        md5 = hashlib.md5()
        md5.update(audio)
        self.id = md5.hexdigest()
        self.audio = audio
        self.name = name

    def __repr__(self):
       return '<Audio %r>' % self.name


class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    title = db.Column(db.String(128), unique=True)
    address = db.Column(db.String(256), unique=True)
    city = db.Column(db.String(128))
    state = db.Column(db.String(128))
    zip = db.Column(db.Integer) #db.Numeric(precision=None, scale=None, decimal_return_scale=None, asdecimal=True) ??
    country = db.Column(db.String(128))
    share = db.Column(db.String(80))
    stories = db.Column(db.String(128))

    def __init__(self, lat, lng, title, address, city, state, zip, country, share, stories):
        self.lat = lat
        self.lng = lng
        self.title = title
        self.address = address
        self.city = city
        self.state = state
        self.zip = zip
        self.country = country
        self.share = share
        self.stories = stories

    def __repr__(self):
       return '<Location %r>' % self.title


class Segment(db.Model):
    __tablename__ = 'segments'
    id = db.Column(db.Integer, primary_key=True)
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'))
    story = db.relationship('Story', back_populates="segments") # backref=db.backref('segments')
    title = db.Column(db.String(128), unique=True)
    time = db.Column(db.Integer)
    desc = db.Column(db.String(256))
    lat = db.Column(db.Float)
    long = db.Column(db.Float)

    def __init__(self, story_id, title, time, desc, latlong):
        self.story_id = story_id
        self.title = title
        self.time = time
        self.desc = desc
        self.lat = latlong[0]
        self.long = latlong[1]

    def __repr__(self):
        return '<Segment %r>' % self.title


#
# Helpers
#

def json_response(response_dict):
    '''Takes dict or list of dicts and returns a jsonified response'''
    response_json = json.dumps(response_dict)
    response = make_response(response_json)
    response.headers['content_type'] = 'application/json'
    return response

def date_from_form(field):
    date_components = [int(x) for x in field.split('-')] 
    return datetime.date(*date_components)
    
def try_login_user(email, password):
    if not password:
        return None
    try:
        user = User.query.filter_by(email=email).one()
    except NoResultFound:
        return None
    if not check_hash(password, user.password):
        return None
    login_user(user)
    return user


@login_manager.user_loader
def load_user(userid):
    return User.query.get(int(userid))

login_manager.login_view = "login"


#
# Views
#

@app.route('/')
@app.route('/index')
def index():
    """Return the main view."""
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = try_login_user(email, password)
        if user is None:
            error = u'Login failed'
            flash(error)
        else:
            return redirect(url_for('index'))
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    logout_user()
    flash(u'You were logged out')
    return redirect(url_for('index'))


#
# File Upload
#

app.config["UPLOADED_PHOTOS_DEST"] = "photos"
app.config["UPLOADED_AUDIO_DEST"] = "audio"

photos = UploadSet('photos', IMAGES)
audio_files = UploadSet('audio', AUDIO)
configure_uploads(app, (photos, audio_files))

@app.route('/upload', methods=['GET'])
@login_required
def upload():
    stories_dict = [{"id":repr(s.id), "story": s.story} for s in Story.query.all()]
    audio_dict =[{"id":repr(a.id), "name": a.name} for a in Audio.query.all()]
    return render_template('upload.html', stories = stories_dict, audio_files=audio_dict)

@app.route('/upload/photo/', methods=['GET', 'POST'])
@login_required
def photo_upload():
    if request.method == 'POST' and 'photo' in request.files:
        filename = photos.save(request.files['photo'])
        photo = Photo(image=filename,
                    name = request.form['name'],
                    date = date_from_form(request.form['date']),
                    description = request.form['description'],
                    stories = request.form['stories'],
                    share = request.form['share'])
        db.session.add(photo)
        db.session.commit()
        flash(u"Photo saved.")
        #return redirect(url_for('show', id=photo.id))
    return redirect(url_for('upload'))

@app.route('/upload/audio/', methods=['GET', 'POST'])
@login_required
def audio_upload():
    if request.method == 'POST' and 'audio' in request.files:
        filename = audio_files.save(request.files['audio'])
        audio = Audio(audio=filename, name = request.form['name'])
        db.session.add(audio)
        db.session.commit()
        flash(u"Audio file saved.")
        #return redirect(url_for('listen', id=rec.id))
    return redirect(url_for('upload'))
    
@app.route('/upload/story/', methods=['GET', 'POST'])
@login_required
def add_entry():
    if request.method == 'POST':
        try: entry = Story(story = request.form['story'],
                           audio = request.form['audio'],
                           title = request.form['title'],
                           date = date_from_form(request.form['date']),
                           text = request.form['text'],
                           tags = request.form['tags'].strip().split(",")
                           )
        except:
            print "Unexpected error:", sys.exc_info()[0]
            print "Form:", request.form
            raise
    db.session.add(entry)
    db.session.commit()
    flash(u'New entry was successfully posted')
    return redirect(url_for('upload'))  #set to 'view_stories' later??

@app.route('/edit/story/<id>', methods=['GET', 'POST'])
@login_required
def edit_story(id):
    try: story_entry = Story.query.get(int(id))
    except NoResultFound:
        flash(u'Story not found.')
        return redirect(url_for('upload'))
    except:
            print "Unexpected error:", sys.exc_info()[0]
            raise
    if request.method == 'GET':
        audio_dict =[{"id":repr(a.id), "name": a.name} for a in Audio.query.all()]
        story_entry.tag = ", ".join([tag.tag_text for tag in story_entry.tags])  #not overwriting tags
        return render_template('edit_story.html', story = story_entry, audio_files = audio_dict)
    if request.method == 'POST':
        #story_entry.story = request.form['story'],
        story_entry.audio = request.form['audio'],
        story_entry.title = request.form['title'],
        story_entry.date = date_from_form(request.form['date']),
        story_entry.text = request.form['text'],
        story_entry.tags = request.form['tags'].strip().split(",")
        db.session.add(story_entry)
        db.session.commit()
        flash(u'Story successfully edited')
        return redirect(url_for('upload'))
    
@app.route('/photo/<id>') #Not tested
def show(id):
    photo = Photo.load(id)
    if photo is None:
        abort(404)
    url = photos.url(photo.filename)
    return render_template('show.html', url=url, photo=photo)


#
# API methods
#

@app.route('/api/story/', methods=['GET'])
def get_stories():
    try:
        stories = [{repr(s.id):{"story": s.story,
                            "audio": s.audio,
                            "storyTitle": s.title,
                            "rDate": str(s.date),
                            "sText": s.text,
                            "sTags": [tag.tag_text for tag in s.tags]
                            }
                    } for s in Story.query.all()]
    except NoResultFound:
        return None
    return json_response(stories)

@app.route('/api/story/<story>', methods=['GET'])
def show_story(story):
    story = Story.query.filter_by(story=story).all() #.first()
    story_dict = {repr(story.id):{"story": story.story,
                                  "audio": story.audio,
                                  "storyTitle": story.title,
                                  "rDate": str(story.date),
                                  "sText": story.text,
                                  "sTags": [tag.tag_text for tag in story.tags]
                                  }
                  }
    story_dict[repr(story.id)]["segment"] = [{"segTitle":seg.title,
                                              "time":seg.time,
                                              "desc":seg.desc,
                                              "latlong":[seg.lat, seg.long]
                                              } for seg in Segment.query.filter_by(story_id=repr(story.id)).all()]
    return json_response(story_dict)

@app.route('/api/photo/', methods=['GET'])
def get_photos():
    photos = [{repr(p.id):{"i":p.image,
                           "n":p.name,
                           "date":str(p.date),
                           "d":p.description,
                           "s":p.stories,
                           "share": p.share
                           }
               } for p in Photo.query.all()]
    return json_response(photos)

@app.route('/api/photo/<photo>', methods=['GET'])
def show_photo(photo):
    photo = Photo.query.filter_by(photo=photo).first()
    photo_dict = {repr(photo.id):{"i":photo.image,
                                   "n":photo.name,
                                   "date":str(photo.date) ,
                                   "d":photo.description ,
                                   "s":photo.stories ,
                                   "share":photo.share}}
    return json_response(photo_dict)


@app.errorhandler(404)
def not_found(error):
    response = make_response(json.dumps({ 'error': 'Not found' }), 404)
    response.headers['content_type'] = 'application/json'
    return response


if __name__ == '__main__':
    app.run(debug = True)
