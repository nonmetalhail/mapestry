from flask import Flask, make_response
from flask.ext.sqlalchemy import SQLAlchemy
import hashlib, json


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/mapestry.db'
db = SQLAlchemy(app)


class Story(db.Model):
    __tablename__ = 'stories'
    id = db.Column(db.Integer, primary_key=True)
    story = db.Column(db.String(80), unique=True)
    audio = db.Column(db.String(80), unique=True)
    title = db.Column(db.String(80), unique=True)
    date = db.Column(db.Date)
    text = db.Column(db.Text, unique=True)
    tags = db.Column(db.String(256))
    
    def __init__(self, story, audio, title, date, text, tags):
        self.story = story      #is this one necessary or is id sufficient going forward?
        self.audio = audio 
        self.title = title
        self.date = date
        self.text = text
        self.tags = tags

    def __repr__(self):
        return '<Story %r>' % self.title
        
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
    story = db.relationship('Story',
        backref=db.backref('posts', lazy='dynamic'))
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
    stories = [{repr(s.id):{"story": s.story, "audio": s.audio, "storyTitle": s.title, "rDate": str(s.date), "sText": s.text, "sTags": s.tags}} for s in Story.query.all()]
    return json_response(stories)
    
@app.route('/api/Photo/', methods=['GET'])
def get_photos():
    photos = [{repr(p.id):{"i":p.image, "n":p.name, "date":str(p.date), "d":p.description, "s":p.stories, "share": p.share}} for p in Photo.query.all()]
    return json_response(photos)
    
@app.route('/api/story/<story>', methods=['GET'])
def show_story(story):
    story = Story.query.filter_by(story=story).first()
    story_dict = {repr(story.id):{"story": story.story, "audio": story.audio, "storyTitle": story.title, "rDate": str(story.date), "sText": story.text, "sTags": story.tags}}
    story_dict[repr(story.id)]["segment"] = [{"segTitle":seg.title, "time":seg.time, "desc":seg.desc, "latlong":[seg.lat, seg.long]} for seg in Segment.query.filter_by(story_id=repr(story.id)).all()]
    return json_response(story_dict)

'''
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
