const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const ejsMate = require('ejs-mate')
const User = require('./models/user');
const Admin = require('./models/admin')
const Assignment = require('./models/assignment');
const MarksAndComments = require('./models/marks');
const bcrypt = require('bcrypt');
const session = require('express-session')
const app = express();
const ejs = require('ejs')
const Joi = require('joi'); 
const multer = require('multer');


mongoose.connect('mongodb://127.0.0.1:27017/portal')
    .then(() => {
        console.log("Mongo Connection Open!!");
    })
    .catch(err => {
        console.log("Error found");
        console.error(err);
    });


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: 'notgoodatsecret',
  resave: false,  
  saveUninitialized: true,  
}));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, 
}).single('file');

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}

app.get('/home', (req, res) => {
    res.render('home')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/login')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password)
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/home')
    } else {
        res.render('login', { error: 'Invalid username or password. Please try again.' });
    }
})



app.get('/logout', (req, res) => {
    req.session.user_id = null;                                            
    res.redirect('/login');
})

app.get('/timetable', (req, res) => {
    res.render('timetable')
})
app.get('/examination', (req, res) => {
    res.render('exam')
})

app.get('/Assignment', async (req, res) => {
    try {
        const assignments = await Assignment.find();
        const marksAndComments = await MarksAndComments.find();
    
        const mergedData = assignments.map(assignment => {
            const markAndComment = marksAndComments.find(item => item.assignmentName === assignment.title);
            return {
                ...assignment._doc,
                marks: markAndComment ? markAndComment.marks : 'Not graded yet',
                comment: markAndComment ? markAndComment.comment : 'No comments'
            };
        });
    
        res.render('assignment', { assignments: mergedData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.send('Error uploading file.');
        }
        const assignment = new Assignment({
            title: req.body.title,
            file: req.file.filename,
        });
        await assignment.save();
        res.redirect('/assignment');
    });
});

app.get('/admin/login', (req,res) => {
    res.render('admin')
})
app.get('/admin/correct', async (req,res) => {
    try {
        
        const assignments = await Assignment.find(); 
    
        res.render('correct.ejs', { assignments }); 
      } catch (error) {
        res.status(500).send('Internal Server Error');
      }
})

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    await User.findAndValidate(username, password)
    if (username === 'admin' && password === 'admin') {
      res.redirect('/admin/correct')

    } else {
     
      res.render('admin', { error: 'Invalid username or password. Please try again.' });
    }
  });

app.post('/admin/correct', async (req, res) => {
    try {
        const assignmentId = req.body.assignment; 
        const marks = req.body.marks;
        const comment = req.body.comment;
    
        const assignment = await Assignment.findById(assignmentId);
    
        if (!assignment) {
          return res.status(404).send('Assignment not found');
        }
    
        
        const marksAndComments = new MarksAndComments({
          assignmentName: assignment.title,
          marks: marks,
          comment: comment
        });
    
        await marksAndComments.save();
    
        res.redirect('/admin/correct'); 
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
});


app.listen(3000, () => {
    console.log('Serving on port 3000')
})