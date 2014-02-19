from flask import Flask, make_response
from flask.ext.sqlalchemy import SQLAlchemy
import hashlib, json
import login, file_handler

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/mapestry.db'
db = SQLAlchemy(app)


class Story(db.Model):
    __tablename__ = 'stories'
    id = db.Column(db.Integer, primary_key=True)
    story = db.Column(db.String(80), unique=True)  #is this one necessary or is id sufficient going forward?
    audio = db.Column(db.String(80), unique=True)
    title = db.Column(db.String(80), unique=True)
    date = db.Column(db.Date)
    text = db.Column(db.Text, unique=True)
    segments = db.relationship('Segment', back_populates="story")
    user = db.relationship(User, backref='posts')
    tags = db.relationship('Tag', secondary=story_tags_table)
    
    '''
    def __init__(self, story, audio, title, date, text, tags):
        self.story = story      
        self.audio = audio 
        self.title = title
        self.date = date
        self.text = text
        if type(tags) is list:
            for tag in tags:
                db.session.add(Tag(tag_text = tag, 
story_id=db.select([Story.id]).where(Story.story==story).as_scalar()))
        else: 
            db.session.add(Tag(story_id=db.select([Story.id]).where(Story.story==story).as_scalar(),
                               tag_text = tags))
       '''                        
                                    
    def __repr__(self):
        return '<Story %r>' % self.title
        
story_tags_table = db.Table('story_tags', db.Model.metadata,
                           db.Column('story_id', db.Integer, db.ForeignKey('story.id')),
                           db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'))
                           )
                                   
class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    tag_text = db.Column(db.String(80))
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'))
    story = db.relationship('Story', back_populates="tags")  #backref=db.backref('tags') ??
        
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

    
def json_response(response_dict):
    '''Takes dict or list of dicts and returns a jsonified response'''
    response_json = json.dumps(response_dict)
    response = make_response(response_json)
    response.headers['content_type'] = 'application/json'
    return response    
        
@app.route('/api/story/', methods=['GET'])       
def get_stories():
    stories = [{repr(s.id):{"story": s.story, 
                            "audio": s.audio, 
                            "storyTitle": s.title, 
                            "rDate": str(s.date), 
                            "sText": s.text, 
                            "sTags": [tags['tag_text'] for tags in Tag.query.filter(story=s.story)]
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
                                  "sTags": [tags['tag_text'] for tags in Tag.query.filter(story=story.story)]
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

'''    
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_entries'))
    return render_template('login.html', error=error)
    
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('index'))

@app.route('/')
def index():
    """Return the main view."""
    return render_template('index.html')    
'''

@app.errorhandler(404)
def not_found(error):
    response = make_response(json.dumps({ 'error': 'Not found' }), 404)
    response.headers['content_type'] = 'application/json'
    return response


if __name__ == '__main__':
    app.run(debug = True)
