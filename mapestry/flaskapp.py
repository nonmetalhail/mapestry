from flask import Flask, make_response
from flask.ext.sqlalchemy import SQLAlchemy
import hashlib, json


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/mapestry.db'
db = SQLAlchemy(app)


class Story(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    story = db.Column(db.String(80), unique=True)
    audio = db.Column(db.String(80), unique=True)
    title = db.Column(db.String(80), unique=True)
    date = db.Column(db.Date)
    text = db.Column(db.Text, unique=True)
    tags = db.Column(db.String(256))
    
    def __init__(self, story, audio, title, date, text, tags):
        self.story = story  #is this one necessary?
        self.audio = audio 
        self.title = title
        self.date = date
        self.text = text
        self.tags = tags

    def __repr__(self):
        return '<Story %r>' % self.title
        
class Photo(db.Model):
    id = db.Column(db.String(32), primary_key=True) #md5
    image = db.Column(db.String(80), unique=True)
    name = db.Column(db.String(80), unique=True)
    date = db.Column(db.Date)  #db.DateTime, default=datetime.datetime.now)
    description = db.Column(db.String(256))
    stories = db.Column(db.String(256))
    share = db.Column(db.String(80))
    
    
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
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    title = db.Column(db.String(128), unique=True)
    address = db.Column(db.String(256), unique=True)
    city = db.Column(db.String(128))
    state = db.Column(db.String(128))
    zip = db.Column(Integer)
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
    id = db.Column(db.Integer, primary_key=True)
    story = db.Column(db.Integer)
    title = db.Column(db.String(128), unique=True)   
    time = db.Column(db.Integer)
    desc = db.Column(db.String(256))
    latlong = db.Column(db.String(128))
    
    def __init__(self, story, title, time, desc, latlong):
        self.story = story
        self.title = title
        self.time = time
        self.desc = desc
        self.latlon = latlong
    
    def __repr__(self)
        return '<Segment %r>' % self.title
        
        
@app.route('/api/story/', methods=["GET"])       
def get_stories():
    stories = [{repr(s.id):{"story": s.story, "audio": s.audio, "storyTitle": s.title, "rDate": repr(s.date), "sText": s.text, "sTags": s.tags}} for s in Story.query.all()]
    stories_json = json.dumps(stories)
    response = make_response(stories_json)
    response.headers['content_type'] = 'application/json'
    return response
    
@app.route('/api/Photo/', methods=["GET"])
def get_photos():
    Photos = [{repr(p.id):{"i":p.image, "n":p.name, "date":repr(p.date), "d":p.description, "s":p.stories, "share": p.share}} for p in Photo.query.all()]
    Photos_json = json.dumps(Photos)
    response = make_response(Photos_json)
    response.headers['content_type'] = 'application/json'
    return response
    
@app.errorhandler(404)
def not_found(error):
    response = make_response(json.dumps({ 'error': 'Not found' }), 404)
    response.headers['content_type'] = 'application/json'
    return response


if __name__ == '__main__':
    app.run(debug = True)
