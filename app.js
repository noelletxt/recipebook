const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // port: 3316,
    // database: 'ga237'
    host: 'mysql-noelletxt.alwaysdata.net',
    user: 'noelletxt',
    password: 't0637213e',
    database: 'noelletxt_recipebook'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// Enable static files
app.use(express.static('public'));

// Enable form processing
app.use(express.urlencoded({
    extended: false
}));


// Define routes

// Example: Home route
app.get('/', (req, res) => {
    connection.query('SELECT * FROM recipelist', (error, results) => {
        if (error) throw error;
        res.render('index', { recipelist: results }); // Render HTML page with data
    });
});

// Route to get product by ID
app.get('/recipe/:id', (req, res) => {
    const recipeid = req.params.id;
    const sql = 'SELECT * FROM recipelist WHERE recipeid = ?';
    connection.query(sql, [recipeid], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving recipe by ID');
        }
        if (results.length > 0) {
            res.render('recipe', { recipe: results[0] });
        } else {
            res.status(404).send('recipe not found');
        }
    });
});

// Route to display add product form
app.get('/addrecipe', (req, res) => {
    res.render('addrecipe');
});

// Route to add a new product
app.post('/addrecipe', upload.single('image'), (req, res) => {
    const { name, ingredients, instructions } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {
        image = null;
    }

    const sql = 'INSERT INTO recipelist (name, ingredients, instructions, image) VALUES (?,?,?,?)';
    connection.query(sql, [name, ingredients, instructions, image], (error, results) => {
        if (error) {
            console.error('Error adding recipe:', error);
            res.status(500).send('Error adding recipe');
        } else {
            res.redirect('/');
        }
    });
});



// Route to display edit product form
app.get('/editrecipe/:id', (req, res) => {
    const recipeid = req.params.id;
    const sql = 'SELECT * FROM recipelist WHERE recipeid = ?';
    connection.query(sql, [recipeid], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving recipe by ID');
        }
        if (results.length > 0) {
            res.render('editrecipe', { recipe: results[0] });
        } else {
            res.status(404).send('recipe not found');
        }
    });
});
app.post('/editrecipe/:id', upload.single('image'), (req, res) => {
    const { name, ingredients, instructions, existingImage } = req.body;
    let image = existingImage;

    // Check if a new image is uploaded
    if (req.file) {
        image = req.file.filename;
    }

    // Update the recipe in the database
    const updatedRecipe = { name, ingredients, instructions, image };
    updateRecipe(req.params.id, updatedRecipe, (err) => {
        if (err) {
            // Handle error
            res.status(500).send('Error updating recipe');
        } else {
            res.redirect('/');
        }
    });
});

function updateRecipe(id, updatedFields, callback) {
    // Implement the logic to update the recipe in your database
    // This is a placeholder function
    // Example using a hypothetical database function
    database.update('recipes', id, updatedFields, callback);
}

// Route to delete a product
app.get('/deleterecipe/:id', (req, res) => {
    const recipeid = req.params.id;
    const sql = 'DELETE FROM recipeid WHERE recipeid = ?';
    connection.query(sql, [recipeid], (error, results) => {
        if (error) {
            console.error('Error deleting recipe:', error);
            res.status(500).send('Error deleting recipe');
        } else {
            res.redirect('/');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
