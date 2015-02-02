#----Login  [https://flask-login.readthedocs.org/en/latest/#flask.ext.login.LoginManager]

from flask.ext.login import LoginManager, LoginForm
from wtforms import form, fields, validators

login_manager = LoginManager()
login_manager.init_app(app)
        

class LoginForm(form.Form):
    login = fields.TextField(validators=[validators.required()])
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self, field):
        user = db.session.query(User).filter_by(login=self.login.data).first()

        if user is None:
            raise validators.ValidationError('Invalid user')

        if user.password != self.password.data:
            raise validators.ValidationError('Invalid password')

class RegistrationForm(form.Form):
    email = fields.TextField(validators=[validators.required()])
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self, field):
        if db.session.query(User).filter_by(login=self.login.data).count() > 0:
            raise validators.ValidationError('Duplicate email')
