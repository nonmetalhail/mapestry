from flaskapp import db, Story, Photo
import datetime

db.create_all()

example = Story('story','audio', 'title', datetime.date(2009, 5, 15), 'text', 'tags')
example2 = Story('story2','audio2', 'title2', datetime.date(2009, 5, 16), 'text2', 'tags2')
photo = Photo('image','name', datetime.date(2009, 4, 12), 'description', '1,2', 'Private')

db.session.add(example)
db.session.add(example2)
db.session.add(photo)
db.session.commit()

