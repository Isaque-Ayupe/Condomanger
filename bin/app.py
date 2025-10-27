from flask import Flask, jsonify, request, render_template, send_from_directory, session, redirect, url_for
from config import app, UPLOAD_FOLDER,CORS, db
import os
from werkzeug.utils import secure_filename
from models import usuario


# Cria a pasta de uploads se ela não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# =================================================================
# --- ROTAS PRINCIPAIS E DE ARQUIVOS ---
# =================================================================
@app.route('/')
def home:
    return render_template('index')

#rota de login
def login():
    cpf = request.json.get('cpf')
    senha = request.json.get('senha')

    #query de login
    usuario = usuario.query.filter_by(cpf= cpf).first()

    if usuario and usuario.verificar_senha(senha):
        session['usuario_id'] = usuario.id
        session['nivel'] = usuario.nivel_usuario
        if usuario.nivel_usuario == 'adm':
            return redirect(url_for('dashboard_adm'))
        else:
            return redirect(url_for('dashboard_morador'))
    else:
        return jsonify({"msg": "CPF ou senha incorretos!"}), 401


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# =================================================================
# --- MORADORES ---
# =================================================================

#funçaoo para criar usuario 
@app.route("/usuarios", methods=["GET", "POST"])
def registrar():
    data = request.json
    nome = data.get('nome')
    cpf = data.get('cpf')
    email = data.get('email')
    senha = data.get('senha')
    apartamento = data.get('apartamento')
    nivel = data.get('nivel_usuario')

    # Evita duplicar CPF ou e-mail
    if usuario.query.filter((usuario.cpf == cpf) | (usuario.email == email)).first():
        return jsonify({"msg": "Usuário já cadastrado!"}), 400

    novo_usuario = usuario(nome, cpf, email, senha, apartamento, nivel)
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"msg": "Usuário criado com sucesso!"}), 201


#função para editar ou excluir morador
@app.route("/moradores/<int:morador_id>", methods=["PUT", "DELETE"])
def edita_morador(user_id,nivel):
    usuario = usuario.query.get(user_id,nivel)


    if usuario.nivel == 'adm':
        return jsonify({"message": "não é possivel alterar adm"})
    if not usuario:
        return jsonify({"message": "Morador não encontrado"}), 404
    if request.method == "PUT":
        data = request.json
        usuario.nome = data.get("nome", usuario.nome)
        usuario.unidade = data.get("unidade", usuario.unidade)
        usuario.email = data.get("email", usuario.email)
        usuario.telefone = data.get("telefone", usuario.telefone)
        db.session.commit()
        return jsonify({"message": "Morador atualizado com sucesso!"}), 200

    if request.method == "DELETE":
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({"message": "Morador excluído com sucesso!"}), 200

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

