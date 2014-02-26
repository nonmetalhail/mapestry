from flask import Flask, make_response, flash, request, render_template, redirect, url_for
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound #, MultipleResultsFound
import hashlib, json

from flask.ext.login import LoginManager, login_user, logout_user, login_required
import hashlib
from os import urandom
from base64 import b64encode, b64decode
from itertools import izip

# From https://github.com/mitsuhiko/python-pbkdf2
from pbkdf2 import pbkdf2_bin

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/mapestry.db'
app.config['SECRET_KEY'] = 'foo'
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
    flash("hash_a:" + hash_a + " hash_b:" + hash_b)
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
    #user = db.relationship(User, backref='posts')
    # tags = db.relationship('Tag', secondary=story_tags_table)
    
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

def try_login_user(email, password):
    if not password:
        print "not password"
        return None
    try: 
        user = User.query.filter_by(email=email).one() 
    except NoResultFound:
        print "No Result Found"
        return None
    if not check_hash(password, user.password):
        print "check_hash fail"
        flash ("user.password: "+user.password+" password"+password)
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
            error = 'Login failed'
            flash(error)
        else:
            return redirect(url_for('index'))
    return render_template('login.html', error=error)

    
@app.route('/logout')
def logout():
    logout_user()
    flash('You were logged out')
    return redirect(url_for('index'))


#
# API methods
#
        
@app.route('/api/story/', methods=['GET'])       
def get_stories():
    stories = [{repr(s.id):{"story": s.story, 
                            "audio": s.audio, 
                            "storyTitle": s.title, 
                            "rDate": str(s.date), 
                            "sText": s.text, 
                            "sTags": [tag.tag_text for tag in s.tags]
                            }
                } for s in Story.query.all()] 
    return json_response(stories)

@app.route('/api/story/<story>', methods=['GET'])
def show_story(story):
    story = Story.query.filter_by(story=story).first()
    story_dict = {repr(story.id):{"story": story.story, 
                                  "audio": story.audio, 
                                  "storyTitle": story.title, 
                                  "rDate": str(story.date), 
                                  "sText": story.text, 
                                  "sTags": [tag.tag_text for tag in s.tags] 
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

@app.route('/api/story/add', methods=['POST'])
@login_required
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    db = get_db()
    db.execute('insert into stories (story, audio, title, date, text) values (?, ?)',
                [request.form['story'],
                 request.form['audio'], 
                 request.form['title'], 
                 request.form['date'], 
                 request.form['text']])
    db.commit()
    flash('New entry was successfully posted')
    return redirect(url_for('show_entries'))


@app.errorhandler(404)
def not_found(error):
    response = make_response(json.dumps({ 'error': 'Not found' }), 404)
    response.headers['content_type'] = 'application/json'
    return response


if __name__ == '__main__':
    app.run(debug = True)
