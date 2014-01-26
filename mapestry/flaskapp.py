from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/mapestry.db'
db = SQLAlchemy(app)


class Story(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    audio = db.Column(db.String(80), unique=True)
    title = db.Column(db.String(80), unique=True)
    date = db.Column(db.Date)
    text = db.Column(db.Text, unique=True)
    tags = db.Column(db.String(256))
    
    def __init__(self, audio, title, date, text, tags):
        self.audio = audio 
        self.title = title
        self.date = date
        self.text = text
        self.tags = tags

    def __repr__(self):
        return '<Story %r>' % self.title
        
class Photos(db.Model):
    id = db.Column(db.String(32), primary_key=True) #md5
    image = db.Column(db.String(80), unique=True)
    name = db.Column(db.String(80), unique=True)
    date = db.Column(db.Date)
    description = db.Column(db.String(256))
    share = db.Column(db.Boolean)
    
    def __init__(self, image, name, date, description, stories):
        self.image = image
        self.name = name
        self.date = date
        self.description = description
        self.share = share
        
    def __repr__(self):
       return '<Photos %r>' % self.name

@app.route('/api/story/', methods=["GET"])       
def get_stories():
    stories = [
    	{
    		"story": s.id,
    		"audio": s.audio, 
    		"storyTitle": s.title, 
    		"rDate": s.date, 
    		"sText": s.text, 
    		"sTags": s.tags
    	}
    	for s in Story.query.all()
    	]
	stories_json = json.dumps(stories)
    response = make_response(stories_json)
    response.headers['content_type'] = 'application/json'
	return response

def index():
    response = make_response(render_template('index.html', foo=42))
    response.headers['X-Parachutes'] = 'parachutes are cool'
    return response

if __name__ == '__main__':
    app.run()
