// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.MONGODB_URI) {
  console.error('Erro: A variável de ambiente MONGODB_URI não está definida.');
  process.exit(1);
}

if (!process.env.PORT) {
  console.warn('A variável de ambiente PORT não está definida. Usando a porta padrão 3000.');
}

// Conectar ao MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => {
    console.error('Erro de conexão:', err);
    process.exit(1); // Encerrar o processo se a conexão falhar
  });

// Configurar EJS como motor de visualização
app.set('view engine', 'ejs');

// Middleware para interpretar dados de formulários e servir arquivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Definir o esquema e modelo de Tarefa
const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Torna o campo obrigatório
    trim: true      // Remove espaços em branco nas extremidades
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); // Adiciona campos de timestamps

const Task = mongoose.model('Task', taskSchema);

// Rota Principal - Exibe todas as tarefas
app.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); // Ordena as tarefas por data de criação (mais recentes primeiro)
    res.render('index', { tasks });
  } catch (err) {
    console.error('Erro ao buscar tarefas:', err);
    res.status(500).send('Erro interno do servidor.');
  }
});

// Rota para Adicionar Tarefa
app.post('/add', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      // Redireciona de volta com uma mensagem de erro (você pode implementar mensagens flash para melhor UX)
      return res.redirect('/');
    }

    const task = new Task({ name: name.trim() });
    await task.save();
    res.redirect('/');
  } catch (err) {
    console.error('Erro ao adicionar tarefa:', err);
    res.status(500).send('Erro ao adicionar tarefa.');
  }
});

// Rota para Completar Tarefa
app.post('/complete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndUpdate(id, { completed: true });
    res.redirect('/');
  } catch (err) {
    console.error('Erro ao completar tarefa:', err);
    res.status(500).send('Erro ao completar tarefa.');
  }
});

// Rota para Deletar Tarefa
app.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.redirect('/');
  } catch (err) {
    console.error('Erro ao deletar tarefa:', err);
    res.status(500).send('Erro ao deletar tarefa.');
  }
});

// Iniciar o Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
