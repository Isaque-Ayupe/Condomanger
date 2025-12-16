# 🏢 CondoManager — Sistema de Gestão Condominial (Beta)

> **CondoManager** é um sistema web de gestão condominial criado para centralizar, organizar e automatizar processos administrativos e de comunicação em condomínios residenciais.

Este repositório representa a **versão beta funcional** do projeto, desenvolvida com foco em resolver dores reais do dia a dia condominial e demonstrar domínio prático de engenharia de software.

---

## 🚀 Visão Geral

A gestão de condomínios ainda depende fortemente de controles manuais, planilhas e comunicação descentralizada (WhatsApp, murais físicos, avisos informais). Isso gera:

* Falta de controle e rastreabilidade
* Conflitos em reservas de áreas comuns
* Comunicação ineficiente entre síndico e moradores
* Baixa visibilidade operacional

O **CondoManager** surge como um **hub digital do condomínio**, centralizando informações críticas em uma única plataforma web.

---

## 🎯 Objetivo do Sistema

Digitalizar a gestão condominial por meio de:

* Centralização de dados de moradores
* Organização e controle de reservas
* Comunicação institucional via mural digital
* Visualização rápida de indicadores operacionais

O sistema foi projetado como um **MVP funcional**, com arquitetura simples, clara e extensível.

---

## 🧩 Principais Funcionalidades

### 👤 Gestão de Moradores

* Cadastro e listagem de moradores
* Base de dados centralizada
* Informações estruturadas para análises futuras

**Benefício:** elimina cadastros paralelos e perda de informações.

---

### 📅 Reserva de Áreas Comuns

* Registro de reservas de áreas compartilhadas
* Controle de conflitos e duplicidades
* Indicadores semanais e mensais

**Benefício:** organização, previsibilidade e redução de conflitos entre moradores.

---

### 📢 Mural Digital (Comunicação Oficial)

* Publicação de avisos institucionais
* Comunicação direta entre gestão e moradores
* Histórico de comunicados

**Benefício:** substitui murais físicos e mensagens informais, garantindo clareza e rastreabilidade.

---

### 📊 Dashboard Gerencial

* Total de moradores cadastrados
* Reservas da semana
* Reservas do mês

**Benefício:** visão rápida do funcionamento do condomínio e suporte à tomada de decisão.

---

## 🛠 Tecnologias Utilizadas

### Backend

* **Python**
* **Flask** — framework web leve e flexível
* Estrutura MVC simplificada

### Frontend

* **HTML5**
* **CSS3**
* **JavaScript**
* Interface focada em simplicidade e usabilidade

### Banco de Dados

* **SQL Relacional**
* Script de criação e estrutura disponível em `MURALDIGITAL.sql`

### Outros

* Organização baseada em boas práticas de projetos Flask
* Separação clara entre lógica de negócio, apresentação e dados

---

## 🧱 Arquitetura do Projeto

```text
CDMG-main/
├── app.py              # Arquivo principal da aplicação Flask
├── config.py           # Configurações do sistema
├── static/             # Arquivos estáticos (CSS, JS, imagens)
│   ├── css/
│   ├── js/
│   └── uploads/
├── MURALDIGITAL.sql    # Script de banco de dados
├── templates/          # Templates HTML
└── Documentação.pdf    # Documentação funcional do projeto
```

---

## 🧠 Diferenciais do Projeto

* 🎯 Foco em **problema real de negócio**
* 🧩 Sistema verticalizado (não genérico)
* 📦 MVP funcional e extensível
* 🛠 Código organizado e compreensível
* 📄 Documentação formal incluída

---

## 🔮 Próximos Passos (Evoluções Planejadas)

* Módulo financeiro (taxas condominiais e inadimplência)
* Notificações automatizadas
* Adequações LGPD
* Deploy em ambiente cloud

---

## 👨‍💻 Contexto do Projeto

Este projeto foi desenvolvido como parte de um processo de aprendizado e consolidação de conhecimentos em:

* Engenharia de Software
* Desenvolvimento Web Full Stack
* Modelagem de sistemas orientados a problemas reais

Ele reflete não apenas habilidades técnicas, mas também **capacidade analítica, visão de produto e preocupação com usabilidade**.

---

## 📌 Status do Projeto

🚧 **Versão Beta** — funcionalidades principais implementadas e em funcionamento.

---

## 📫 Contato

Caso queira conversar sobre o projeto, arquitetura ou possíveis evoluções, fico totalmente aberto a trocas técnicas e feedbacks.

---

> **CondoManager** — tecnologia aplicada para simplificar a vida em condomínio.
