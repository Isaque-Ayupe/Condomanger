from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy 

 #configuração geral
app = Flask(__name__)
CORS(app)


#de onde vem as fotos
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # Limite de 16MB

#configuração do banco

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:1234@127.0.0.1/muraldigital'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

