from flask import Flask, jsonify, request, render_template, send_from_directory
import pymysql
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# --- CONFIGURAÇÃO PARA UPLOAD DE ARQUIVOS ---
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # Limite de 16MB

# Cria a pasta de uploads se ela não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- CONEXÃO COM O BANCO ---
def get_db_connection():
    return pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="1234", 
        database="muraldigital",
        cursorclass=pymysql.cursors.DictCursor
    )

# =================================================================
# --- ROTAS PRINCIPAIS E DE ARQUIVOS ---
# =================================================================
@app.route("/")
def home():
    return render_template("index.html")

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# =================================================================
# --- MORADORES ---
# =================================================================
@app.route("/moradores", methods=["GET", "POST"])
def handle_moradores():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                cursor.execute("SELECT id_moradores as id, nome, endereco AS unidade, email, telefone, foto_url FROM moradores;")
                moradores = cursor.fetchall()
                return jsonify(moradores)
            
            if request.method == "POST":
                data = request.form
                foto_url = None
                if 'foto' in request.files:
                    file = request.files['foto']
                    if file and file.filename != '':
                        filename = secure_filename(file.filename)
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                        foto_url = f"/uploads/{filename}"
                
                sql = "INSERT INTO moradores (nome, endereco, telefone, email, foto_url) VALUES (%s, %s, %s, %s, %s);"
                cursor.execute(sql, (data["nome"], data["unidade"], data["telefone"], data["email"], foto_url))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Morador adicionado!", "id": new_id}), 201
    finally:
        conn.close()

@app.route("/moradores/<int:morador_id>", methods=["PUT", "DELETE"])
def handle_single_morador(morador_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "PUT":
                data = request.json
                # ## CORREÇÃO PRINCIPAL AQUI ##
                # Usando 'id_moradores' na cláusula WHERE para encontrar o morador certo
                sql = "UPDATE moradores SET nome=%s, endereco=%s, email=%s, telefone=%s WHERE id_moradores=%s;"
                cursor.execute(sql, (data["nome"], data["unidade"], data["email"], data["telefone"], morador_id))
                conn.commit()
                return jsonify({"message": "Morador atualizado com sucesso!"}), 200

            if request.method == "DELETE":
                sql = "DELETE FROM moradores WHERE id_moradores=%s;"
                cursor.execute(sql, (morador_id,))
                conn.commit()
                return jsonify({"message": "Morador excluído com sucesso!"}), 200
    finally:
        conn.close()

# =================================================================
# --- COMUNICADOS ---
# =================================================================
@app.route("/comunicados", methods=["GET", "POST"])
def handle_comunicados():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                cursor.execute("SELECT id_comunicados as id, titulo_comunicados as titulo, descricao_comunicados as descricao, data_criacao as data FROM comunicados ORDER BY data_criacao DESC;")
                comunicados = cursor.fetchall()
                return jsonify(comunicados)

            if request.method == "POST":
                data = request.json
                sql = "INSERT INTO comunicados (titulo_comunicados, descricao_comunicados, data_criacao) VALUES (%s, %s, NOW());"
                cursor.execute(sql, (data["titulo"], data["descricao"]))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Comunicado adicionado!", "id": new_id}), 201
    finally:
        conn.close()

@app.route("/comunicados/<int:comunicado_id>", methods=["PUT", "DELETE"])
def handle_single_comunicado(comunicado_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "PUT":
                data = request.json
                # ## CORREÇÃO PRINCIPAL AQUI ##
                # Rota de edição de comunicados agora está completa e correta
                sql = "UPDATE comunicados SET titulo_comunicados=%s, descricao_comunicados=%s WHERE id_comunicados=%s;"
                cursor.execute(sql, (data["titulo"], data["descricao"], comunicado_id))
                conn.commit()
                return jsonify({"message": "Comunicado atualizado com sucesso!"}), 200
            
            if request.method == "DELETE":
                sql = "DELETE FROM comunicados WHERE id_comunicados = %s;"
                cursor.execute(sql, (comunicado_id,))
                conn.commit()
                return jsonify({"message": "Comunicado deletado!"}), 200
    finally:
        conn.close()

# =================================================================
# --- RESERVAS (CÓDIGO ORIGINAL MANTIDO) ---
# =================================================================
@app.route("/reservas", methods=["GET", "POST"])
def handle_reservas():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                sql = "SELECT r.id_reserva as id, r.area, r.data AS data_reserva, r.horario, m.nome as morador_nome FROM reservas r JOIN moradores m ON r.morador_id = m.id_moradores ORDER BY r.data ASC;"
                cursor.execute(sql)
                reservas = cursor.fetchall()
                return jsonify(reservas)
            if request.method == "POST":
                data = request.json
                sql = "INSERT INTO reservas (morador_id, area, data, horario) VALUES (%s, %s, %s, %s);"
                cursor.execute(sql, (data["morador_id"], data["area"], data["data_reserva"], data["horario"]))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Reserva adicionada!", "id": new_id}), 201
    finally:
        conn.close()

@app.route("/reservas/<int:reserva_id>", methods=["DELETE"])
def deletar_reserva(reserva_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM reservas WHERE id_reserva = %s", (reserva_id,))
            conn.commit()
            return jsonify({"message": "Reserva deletada!"}), 200
    finally:
        conn.close()

# =================================================================
# --- CLASSIFICADOS (CÓDIGO ORIGINAL MANTIDO) ---
# =================================================================
@app.route("/classificados", methods=["GET", "POST"])
def handle_classificados():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                sql = "SELECT id_classificados as id, titulo_classificados as titulo, descricao_classificados as descricao, preco, contato, foto_url_class as foto_url, morador_id_class as morador_id FROM classificados ORDER BY id_classificados DESC;"
                cursor.execute(sql)
                classificados = cursor.fetchall()
                return jsonify(classificados)
            if request.method == "POST":
                data = request.form
                foto_url = None
                if 'foto' in request.files:
                    file = request.files['foto']
                    if file and file.filename != '':
                        filename = secure_filename(file.filename)
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                        foto_url = f"/uploads/{filename}"
                sql = "INSERT INTO classificados (titulo_classificados, descricao_classificados, preco, contato, morador_id_class, foto_url_class) VALUES (%s, %s, %s, %s, %s, %s);"
                cursor.execute(sql, (data["titulo"], data["descricao"], data["preco"], data["contato"], data.get("morador_id"), foto_url))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Classificado adicionado!", "id": new_id}), 201
    finally:
        conn.close()

@app.route("/classificados/<int:classificado_id>", methods=["PUT", "DELETE"])
def handle_single_classificado(classificado_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "PUT":
                data = request.json
                sql = "UPDATE classificados SET titulo_classificados=%s, descricao_classificados=%s, preco=%s, contato=%s, morador_id_class=%s WHERE id_classificados=%s;"
                cursor.execute(sql, (data["titulo"], data["descricao"], data["preco"], data["contato"], data.get("morador_id"), classificado_id))
                conn.commit()
                return jsonify({"message": "Classificado atualizado com sucesso!"}), 200
            if request.method == "DELETE":
                sql = "DELETE FROM classificados WHERE id_classificados=%s;"
                cursor.execute(sql, (classificado_id,))
                conn.commit()
                return jsonify({"message": "Classificado excluído com sucesso!"}), 200
    finally:
        conn.close()

# =================================================================
# --- MANUTENÇÃO (CÓDIGO ORIGINAL MANTIDO) ---
# =================================================================
@app.route("/manutencao", methods=["GET", "POST"])
def handle_manutencao():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                cursor.execute("SELECT id_manutenção as id, titulo_manutencao as titulo, descricao_manutencao as descricao, status_manutencao as status, data_manutencao as data FROM manutencao ORDER BY data_manutencao DESC;")
                manutencoes = cursor.fetchall()
                return jsonify(manutencoes)
            if request.method == "POST":
                data = request.json
                sql = "INSERT INTO manutencao (titulo_manutencao, descricao_manutencao, status_manutencao, data_manutencao) VALUES (%s, %s, %s, NOW());"
                cursor.execute(sql, (data["titulo"], data["descricao"], data["status"]))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Manutenção adicionada!", "id": new_id}), 201
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)

