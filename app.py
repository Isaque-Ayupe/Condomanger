from flask import Flask, jsonify, request, render_template, send_from_directory,session, redirect, url_for, flash, make_response
from flask_cors import CORS
import os
import bcrypt
from werkzeug.utils import secure_filename
from functools import wraps
from datetime import date

from config import *

def nocache(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response
#função para obrigar login
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'id_usuario' not in session:
            return redirect(url_for('login'))  # manda pro login se n tiver logado
        return f(*args, **kwargs)
    return decorated_function


# Cria a pasta de uploads se ela não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# ROTAS PRINCIPAIS E DE ARQUIVOS 

@app.route("/")
def login():
    return render_template("Login.html")

#renderiza a tela de sindico
@app.route("/index")
@login_required
def indexadm():
    if 'id_usuario' not in session:
        return redirect("/")

    response = make_response(
        render_template("index.html", user_id=session.get("id_usuario"))
    )
    return nocache(response)


#renderiza a tela de morador
@app.route("/morador")
@login_required
def indexmorador():
    return render_template("morador.html", 
                            user_id=session["id_usuario"])

#rota de logout
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"redirect": "/"})


#rota de login com verificação se existe
@app.route("/login", methods=["POST"])
def logar():
    data = request.get_json()

    email = data.get('email')
    senha = data.get('senha')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id_usuario, senha, nivel FROM usuarios WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    # Se não encontrou usuário
    if user is None:
        return jsonify({"ok": False, "msg": "Login inválido!"}), 401

    senha_hash = user['senha']

    # Verifica senha com bcrypt
    if not bcrypt.checkpw(senha.encode('utf-8'), senha_hash.encode('utf-8')):
        return jsonify({"ok": False, "msg": "Senha incorreta!"}), 401

    # Se chegou aqui, senha bateu
    session['id_usuario'] = user['id_usuario']
    session['nivel'] = user['nivel']

    if user['nivel'] == 'S':
        return jsonify({"ok": True, "redirect": "/index"})
    else:
        return jsonify({"ok": True, "redirect": "/morador"})

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
                    SELECT id_usuario, nome, endereco, email, telefone, foto_url 
                    FROM usuarios;
                """)
                usuarios = cursor.fetchall()
                return jsonify(usuarios), 200
            
            if request.method == "POST":
                data = request.form if request.form else request.get_json()

                foto_url = None
                if 'foto' in request.files:
                    file = request.files['foto']
                    if file and file.filename != '':
                        filename = secure_filename(file.filename)
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                        foto_url = f"/uploads/{filename}"

                # 🔥 Criptografa a senha ANTES de salvar
                senha_pura = data["senha"]
                senha_hash = bcrypt.hashpw(senha_pura.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

                sql = """
                    INSERT INTO usuarios 
                    (nome, endereco, telefone, email, foto_url, nivel, senha)
                    VALUES (%s, %s, %s, %s, %s, 'M', %s);
                """

                cursor.execute(sql, (
                    data["nome"],
                    data["endereco"],
                    data["telefone"],
                    data["email"],
                    foto_url,
                    senha_hash   # 👈 senha já vai criptografada!
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
                    "SELECT id_comunicados as id, titulo_comunicados as titulo, descricao_comunicados as descricao, data_criacao as data, usuario  FROM comunicados ORDER BY data_criacao DESC;")
                comunicados = cursor.fetchall()
                return jsonify(comunicados)

            if request.method == "POST":
                usuario= session.get("id_usuario")  
                if not usuario:
                    return jsonify({"error": "Usuário não logado"}), 401
                data = request.json

                sql = """
                         INSERT INTO comunicados (
                                                    titulo_comunicados,
                                                    descricao_comunicados,
                                                    data_criacao,
                                                    usuario) 
                         VALUES (%s, %s, NOW(),%s);
                      """
                cursor.execute(sql, (data["titulo"], data["descricao"],usuario))
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
                cursor.execute("SELECT * FROM vw_reservas_com_moradores ORDER BY data ASC;")
                reservas = cursor.fetchall()
                
                # 🎯 CORREÇÃO: Formata objetos 'date' para string 'YYYY-MM-DD' 🎯
                for reserva in reservas:
                    if isinstance(reserva['data'], date):
                        # Garante que a data seja enviada como string simples
                        reserva['data'] = reserva['data'].strftime('%Y-%m-%d')
                
                return jsonify(reservas)

            if request.method == "POST":
                usuario= session.get("id_usuario")  
                if not usuario:
                    return jsonify({"error": "Usuário não logado"}), 401
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
                insert_sql = "INSERT INTO reservas (usuario, area, data, status, horario) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(insert_sql, (
                    usuario,
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
# --- CLASSIFICADOS 
# =================================================================

@app.route("/meus_classificados", methods=["GET"])
def meus_classificados():
    usuario = session.get("id_usuario")
    if not usuario:
        return jsonify({"error": "Usuário não logado"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT *
                FROM usuario_classificados
                WHERE id_usuario = %s;
            """
            cursor.execute(sql, (usuario,))
            meus = cursor.fetchall()
            return jsonify(meus), 200

    finally:
        conn.close()

#rota de select e criação de classificado
@app.route("/classificados", methods=["GET", "POST"])
def classificados():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":
                sql = """SELECT * FROM usuario_classificados;"""
                cursor.execute(sql)
                classificados = cursor.fetchall()
                return jsonify(classificados)
            
            if request.method == "POST":
                usuario= session.get("id_usuario")  
                if not usuario:
                    return redirect({"error": "Usuário não logado"}), 401

                data = request.form
                foto_url = None
                if 'foto' in request.files:
                    file = request.files['foto']
                    if file and file.filename != '':
                        filename = secure_filename(file.filename)
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                        foto_url = f"/uploads/{filename}"
                sql = "INSERT INTO classificados (titulo_classificados, descricao_classificados, preco, contato, foto_url_class, usuario) VALUES (%s, %s, %s, %s, %s, %s);"
                cursor.execute(sql, (data["titulo_classificados"], data["descricao_classificados"], data["preco"], data["contato"],foto_url, session.get("id_usuario"),))
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
                sql = """
                UPDATE classificados
                  SET titulo_classificados=%s, descricao_classificados=%s, preco=%s, contato=%s
                  WHERE id_classificados=%s;
                """
                cursor.execute(sql, (data["titulo"], data["descricao"], data["preco"], data["contato"], classificado_id))
                conn.commit()
                return jsonify({"message": "Classificado atualizado com sucesso!"}), 200
            
            if request.method == "DELETE":
                sql = "DELETE FROM classificados WHERE id_classificados=%s;"
                cursor.execute(sql, (classificado_id,))
                conn.commit()
                return jsonify({"message": "Classificado excluído com sucesso!"}), 200
    finally:
        conn.close()

def selection_sort(lista, crescente=True):
    n = len(lista)
    
    for i in range(n):
        idx_extremo = i

        for j in range(i + 1, n):
            if crescente:
                if lista[j]["preco"] < lista[idx_extremo]["preco"]:
                    idx_extremo = j
            else:
                if lista[j]["preco"] > lista[idx_extremo]["preco"]:
                    idx_extremo = j
        
        lista[i], lista[idx_extremo] = lista[idx_extremo], lista[i]

    return lista

@app.route("/classificados/ordenar", methods=["GET"])
def ordenar_classificados():
    tipo = request.args.get("tipo", "crescente")  # crescente ou decrescente

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM usuario_classificados;")
            classificados = cursor.fetchall()

        # transformar Decimal em float se necessário
        for c in classificados:
            c["preco"] = float(c["preco"])

        crescente = (tipo == "crescente")
        classificados_ordenados = selection_sort(classificados, crescente=crescente)

        return jsonify(classificados_ordenados)

    finally:
        conn.close()

# =================================================================
# --- MANUTENÇÃO 
# =================================================================
def traduz_status_front(status):
    mapa = {
                     "pendente": "pending",
                    "em_andamento": "in-progress",
                    "resolvido": "resolved"
            }
    return mapa.get(status, "pending")


@app.route("/manutencao", methods=["GET", "POST"])
def manutencao():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "GET":

                sql = """ SELECT * from usuario_manutencao ORDER BY data DESC; """
                cursor.execute(sql)
                manutencoes = cursor.fetchall()
                return jsonify(manutencoes)
            
            if request.method == "POST":
                usuario= session.get("id_usuario")  
                if not usuario:
                    return jsonify({"error": "Usuário não logado"}), 401

                data = request.json
                sql = "INSERT INTO manutencao (titulo_manutencao, descricao_manutencao, status_manutencao, data_manutencao,usuario) VALUES (%s, %s, %s, NOW(),%s);"
                cursor.execute(sql, (data["titulo"], data["descricao"], traduz_status_front(data["status"]), data.get("usuario") ))
                new_id = cursor.lastrowid
                conn.commit()
                return jsonify({"message": "Manutenção adicionada!", "id": new_id}), 201
    finally:
        conn.close()

@app.route("/manutencao/<int:manutencao_id>", methods=["PUT", "DELETE"])
def edita_manutençao(manutencao_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if request.method == "PUT":
                data = request.json
                sql = """
                UPDATE manutencao
                  SET titulo_manutencao=%s, descricao_manutencao=%s, status_manutencao=%s
                  WHERE id_manutencao=%s;
                """
                cursor.execute(sql, (data["titulo"], data["descricao"], data["status"], manutencao_id))
                conn.commit()
                return jsonify({"message": "manutencao atualizada com sucesso!"}), 200
            
            if request.method == "DELETE":
                sql = "DELETE FROM manutencao WHERE id_manutencao=%s;"
                cursor.execute(sql, (manutencao_id,))
                conn.commit()
                return jsonify({"message": "excluída com sucesso!"}), 200
    finally:
        conn.close()

@app.route("/alterar_senha", methods=["POST"])
def alterar_senha():
    if "id_usuario" not in session:
        return jsonify({"error": "Usuário não autenticado."}), 401

    data = request.get_json()
    current_pass = data.get("current_password")
    new_pass = data.get("new_password")

    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            
            # Pega senha atual do banco
            cursor.execute("SELECT senha FROM usuarios WHERE id_usuario = %s", 
                           (session["id_usuario"],))
            result = cursor.fetchone()

            if not result:
                return jsonify({"error": "Usuário não encontrado."}), 404

            senha_hash = result["senha"]

            # Confere senha atual
            if not bcrypt.checkpw(current_pass.encode('utf-8'), senha_hash.encode('utf-8')):
                return jsonify({"error": "Senha atual incorreta."}), 400

            # Gera hash nova senha
            novo_hash = bcrypt.hashpw(new_pass.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            # Atualiza senha
            cursor.execute("""
                UPDATE usuarios 
                SET senha = %s 
                WHERE id_usuario = %s
            """, (novo_hash, session["id_usuario"]))

            conn.commit()

            return jsonify({"message": "Senha alterada com sucesso!"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Erro interno no servidor."}), 500
    
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)

