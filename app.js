const express = require('express');
const cors = require('cors');
const db = require('./config/database');


db.authenticate()
    .then(() => console.log('Database Connected'))
    .catch(err => console.log('Error:', err));
    
const app = express();

app.use(cors());
app.use(express.static('./public'));
app.use(express.json());

app.use('/categories', require('./routes/categories'));
app.use('/blogs', require('./routes/blogs'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
