from flask.ext.Flask-Uploads import UploadSet, IMAGES, AUDIO, configure_uploads  #http://pythonhosted.org/Flask-Uploads/
photos = UploadSet('photos', IMAGES)
audio = UploadSet('audio', AUDIO)

configure_uploads(app, (photos, audio))

@app.route('/upload/photo/', methods=['GET', 'POST'])
def photo_upload():
    if request.method == 'POST' and 'photo' in request.files:
        filename = photos.save(request.files['photo'])
        rec = Photo(filename=filename, user=g.user.id)
        rec.store()
        flash("Photo saved.")
        return redirect(url_for('show', id=rec.id))
    return render_template('upload.html')
    
    '''include the following:
    <form method=POST enctype=multipart/form-data action="{{ url_for('photo_upload') }}">
    ...
    <input type=file name=photo>
    ...
    </form>
    '''

@app.route('/upload/audio/', methods=['GET', 'POST'])
def audio_upload():
    if request.method == 'POST' and 'audio' in request.files:
        filename = photos.save(request.files['audio'])
        rec = Photo(filename=filename, user=g.user.id)
        rec.store()
        flash("Audio file saved.")
        return redirect(url_for('show', id=rec.id))
    return render_template('upload.html')
    
    '''include the following:
    <form method=POST enctype=multipart/form-data action="{{ url_for('audio_upload') }}">
    ...
    <input type=file name=audio>
    ...
    </form>
    '''
    
@app.route('/photo/<id>')
def show(id):
    photo = Photo.load(id)
    if photo is None:
        abort(404)
    url = photos.url(photo.filename)
    return render_template('show.html', url=url, photo=photo)
    
