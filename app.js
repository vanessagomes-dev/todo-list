const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Conectar ao MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch(err => console.error('Erro de conexão:', err));

// Configurar EJS
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Modelo de Tarefa
const taskSchema = new mongoose.Schema({
  name: String,
  completed: { type: Boolean, default: false }
});

const Task = mongoose.model('Task', taskSchema);

// Rota Principal
app.get('/', async (req, res) => {
  const tasks = await Task.find();
  res.render('index', { tasks });
});

// Adicionar Tarefa
app.post('/add', async (req, res) => {
  const task = new Task({ name: req.body.name });
  await task.save();
  res.redirect('/');
});

// Completar Tarefa
app.post('/complete/:id', async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, { completed: true });
  res.redirect('/');
});

// Deletar Tarefa
app.post('/delete/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Iniciar o Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
