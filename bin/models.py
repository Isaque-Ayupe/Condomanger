from dataclasses import dataclass
import bcrypt as bc
from datetime import datetime, timedate
from config import db
from werkzeug.security import generate_password_hash, check_password_hash


#classe de usuario 
class usuario(db.Model):
    __tablename__ = 'usuarios' 
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    apartamento = db.Column(db.String(10), nullable=False)
    nivel_usuario = db.Column(db.Enum('adm', 'morador'), nullable=False)

    def __init__(self, nome, cpf, email, senha, apartamento, nivel_usuario):
        self.nome = nome
        self.cpf = cpf
        self.email = email
        self.senha_hash = generate_password_hash(senha)
        self.apartamento = apartamento
        self.nivel_usuario = nivel_usuario

    def to_dict(self):
        return{
            "id": self.id,
            "cpf": self.cpf,
            "email": self.email,
            "apartamento": self.apartamento,
            "nivel_usuario": self.nivel_usuario,
            "telefone": self.telefone
        }
    
    #funcao para verificar a senha
    def verifica_senha(self,senha):
        return  check_password_hash(self.senha_hash,senha)

#classe para comunicados
class comunicado(db.Model): 
    __tablename__ = 'comunicados'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100),nullable =False)
    descricao = db.Column(db.Text, nullable=False)
    duracao = db.Column(db.DateTime,nullable=False) #data de duração de comunicado


    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'),nullable=False)
    usuario = db.relationship('Usuario', backref='comunicados', lazy=True)

    def ativo(self):
        """retorna true se o comunicado ainda estiver ativo"""
        return datetime.now() <= self.duracao
    
class manutencao(db.Model):
  
    __tablename__ = 'manutencao'

    id_manutencao = db.Column(db.Integer, primary_key=True)
    titulo_manutencao = db.Column(db.String(255), nullable=True)
    descricao_manutencao = db.Column(db.Text, nullable=True)
    status_manutencao = db.Column(db.String(100), nullable=True)
    data_manutencao = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Manutencao {self.id_manutencao} - {self.titulo_manutencao}>"
    
class reserva(db.model):
    __tablename__ = 'reserva'

    id_reserva = db.Column(db.Integer, primary_key=True)
    area = db.Column(db.String(50), nullable=False)
    data = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pendente')
    morador_id = db.Column(db.Integer, db.ForeignKey('usuraios.id_moradores'), nullable=True)
    horario = db.Column(db.String(50), nullable=True)

    # Relacionamento (um morador pode ter várias reservas)
    morador = db.relationship('Morador', backref=db.backref('reservas', lazy=True))

    def __repr__(self):
        return f"<Reserva {self.id_reserva} - {self.area} ({self.status})>"