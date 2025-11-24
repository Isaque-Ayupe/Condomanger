from flask import Flask, jsonify, request, render_template, send_from_directory,session, redirect, url_for, flash
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from functools import wraps
from config import *
from datetime import date


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'id_usuario' not in session:
            return redirect(url_for('login'))  # manda pro login se n tiver logado
        return f(*args, **kwargs)
    return decorated_function
# --- CONFIGURAÇÃO PARA UPLOAD DE ARQUIVOS ---
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # Limite de 16MB

# Cria a pasta de uploads se ela não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)



# ROTAS PRINCIPAIS E DE ARQUIVOS 

@app.route("/")
def login():
    return render_template("Login.html")

@app.route("/index")
@login_required
def indexadm():
    return render_template("index.html")

@app.route("/morador")
@login_required
def indexmorador():
    return render_template("indexmorador.html")

@app.route("/login", methods = ["POST"])
def logar():
    data = request.get_json()

    email = data.get('email')
    senha= data.get('senha')

    # Consulta no banco se o usuário existe
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id_usuario, senha, nivel  FROM usuarios WHERE email=%s AND senha=%s", (email, senha))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    #verificação de nivel de usuario para renderização
    if user is not None:
        # Se existir, salva dados na sessão
        session['id_usuario'] = user['id_usuario']
        session['nivel'] = user['nivel']

        if user['nivel'] =='S':

            return jsonify({"ok": True, "redirect": "/index"})
        else:
            # MORADOR
            return jsonify({"ok": True, "redirect": "/morador"})
    
    else:
        return jsonify({"ok": False, "msg": "Login inválido!"}), 401

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# =================================================================
# --- MORADORES ---
# =================================================================
@app.route("/usuarios", methods=["GET", "POST"])
def usuario():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:

            if request.method == "GET":
                cursor.execute("""
                               SELECT id_usuario, nome,endereco,email,telefone,foto_url FROM usuarios;"""
                               )
                usuarios = cursor.fetchall()
                return jsonify(usuarios),200
            
            if request.method == "POST":
                data = request.form if request.form else request.get_json()
                foto_url = None
                if 'foto' in request.files:
                    file = request.files['foto']
                    if file and file.filename != '':
                        filename = secure_filename(file.filename)
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                        foto_url = f"/uploads/{filename}"
                
                sql = """
                    INSERT INTO usuarios 
                    (nome, endereco, telefone, email, foto_url,nivel,senha)
                      VALUES (%s, %s, %s, %s, %s, 'M',%s);
                """
                cursor.execute(sql, (
                    data["nome"], 
                    data["endereco"], 
                    data["telefone"], 
                    data["email"],
                    foto_url,
                    data["senha"],
                    ))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Morador adicionado!", "id": new_id}), 201
    finally:
        conn.close()

@app.route("/usuarios/<int:id_usuario>", methods=["PUT", "DELETE"])
def edita_usuarios(id_usuario):

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "PUT":
                data = request.json
                sql = """
                    UPDATE usuarios 
                    SET nome=%s, endereco=%s, email=%s, telefone=%s 
                    WHERE id_usuario=%s;
                """
                cursor.execute(sql, (
                    data["nome"],
                    data["endereco"],
                    data["email"],
                    data["telefone"],
                    id_usuario
                    ))
                conn.commit()
                return jsonify({"message": "Morador atualizado com sucesso!"}), 200

            if request.method == "DELETE":
                sql = "DELETE FROM usuarios WHERE id_usuario=%s;"
                cursor.execute(sql,(id_usuario,))
                conn.commit()
                return jsonify({"message": "Morador excluído com sucesso!"}), 200
    finally:
        conn.close()

# =================================================================
# --- COMUNICADOS ---
# =================================================================
@app.route("/comunicados", methods=["GET", "POST"])
def comunicado():
    if "id_usuario" not in session:
        return jsonify({"error":"usuario nao autenticado"}), 401
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                cursor.execute(
                    "SELECT id_comunicados as id, titulo_comunicados as titulo, descricao_comunicados as descricao, data_criacao as data FROM comunicados ORDER BY data_criacao DESC;")
                comunicados = cursor.fetchall()
                return jsonify(comunicados)

            if request.method == "POST":
                data = request.json

                id_usuario = session["id_usuario"]
                sql = "INSERT INTO comunicados (titulo_comunicados, descricao_comunicados, data_criacao,usuario) VALUES (%s, %s, NOW(),%s);"
                cursor.execute(sql, (data["titulo"], data["descricao"],id_usuario))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Comunicado adicionado!", "id": new_id}), 201
    finally:
        conn.close()


@app.route("/comunicados/<int:comunicado_id>", methods=["PUT", "DELETE"])
def editacomunicado(comunicado_id):
    if "id_usuario" not in session:
        return jsonify({"error":"usuario nao autenticado"}), 401
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "PUT":
                data = request.json

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
# --- RESERVAS 
# =================================================================
@app.route("/reservas", methods=["GET", "POST"])
def reservas():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                # Sua View já traz todos os dados necessários
                cursor.execute("SELECT * FROM vw_reservas_com_moradores;")
                reservas = cursor.fetchall()
                
                # 🎯 CORREÇÃO: Formata objetos 'date' para string 'YYYY-MM-DD' 🎯
                for reserva in reservas:
                    if isinstance(reserva['data'], date):
                        # Garante que a data seja enviada como string simples
                        reserva['data'] = reserva['data'].strftime('%Y-%m-%d')
                
                return jsonify(reservas)

            if request.method == "POST":
                data = request.json

                # Verificar duplicidade
                check_sql = "SELECT id_reserva FROM reservas WHERE area = %s AND data = %s AND horario = %s"
                cursor.execute(check_sql, (
                    data["area"],
                    data["data_reserva"],
                    data["horario"]
                ))
                existente = cursor.fetchone()

                if existente:
                    return jsonify({"erro": "Este horário já está reservado!"}), 400

                # Inserir se estiver livre
                insert_sql = "INSERT INTO reservas (morador_id, area, data, status, horario) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(insert_sql, (
                    data["morador_id"],
                    data["area"],
                    data["data_reserva"],
                    "ativo",
                    data["horario"]
                ))

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
            delete_sql = "DELETE FROM reservas WHERE id_reserva = %s"
            
            cursor.execute(delete_sql, (reserva_id,))
            
            if cursor.rowcount == 0:
                conn.rollback()
                return jsonify({"erro": "Reserva não encontrada ou já cancelada."}), 404
            
            conn.commit()
            return jsonify({"message": "Reserva cancelada com sucesso!"}), 200
    finally:
        conn.close()

# =================================================================
# --- CLASSIFICADOS (CÓDIGO ORIGINAL MANTIDO) ---
# =================================================================
@app.route("/classificados", methods=["GET", "POST"])
def classificados():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                sql = "SELECT id_classificados as id, titulo_classificados as titulo, descricao_classificados as descricao, preco, contato, foto_url_class as foto_url, usuario_class as usuario FROM classificados ORDER BY id_classificados DESC;"
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
                sql = "INSERT INTO classificados (titulo_classificados, descricao_classificados, preco, contato, usuario_class, foto_url_class) VALUES (%s, %s, %s, %s, %s, %s);"
                cursor.execute(sql, (data["titulo"], data["descricao"], data["preco"], data["contato"], data.get("usuario"), foto_url))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Classificado adicionado!", "id": new_id}), 201
    finally:
        conn.close()

@app.route("/classificados/<int:classificado_id>", methods=["PUT", "DELETE"])
def edita_classificado(classificado_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "PUT":
                data = request.json
                sql = "UPDATE classificados SET titulo_classificados=%s, descricao_classificados=%s, preco=%s, contato=%s, usuario_class=%s WHERE id_classificados=%s;"
                cursor.execute(sql, (data["titulo"], data["descricao"], data["preco"], data["contato"], data.get("usuario"), classificado_id))
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
def manutencao():
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

