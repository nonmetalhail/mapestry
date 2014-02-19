from flaskapp import db, Story, Photo, Segment
import datetime

db.create_all() 
	
example = Story('story','audio', 'title', datetime.date(2009, 5, 15), 'text', ['tags'])
example1 = Story('courtshipMarriage','Gma-01-web-marriage', 'Courtship & Marriage',datetime.date(2013,3,15), 'Grandma Rose talks about how she pursued Grandpa.',[ "Grandma Rose", "Grandpa Wendell","Waterloo","Fall River"])
example2 = Story('story2','audio2', 'title2', datetime.date(2009, 5, 16), 'text2', ['tags2'])
photo = Photo('image','name', datetime.date(2009, 4, 12), 'description', '1,2', 'Private')
segment = Segment(1, "A Cement Cottage", 0, "Growing up in Fall Rivers.", [41.701491,-71.155045])
segment2 = Segment(1,"The Narrows",37,"Rose's grandfather's small farm, picking blueberries.",[41.698962,-71.139198])

for item in [example, example1, example2, photo, segment, segment2]:
	db.session.add(item)

db.session.commit()

