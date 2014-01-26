from flaskapp import db
import datetime

db.create_all()

example = Story('audio', 'title', datetime.date(2009, 5, 15), 'text', 'tags')
db.session.add(example)
db.session.commit()