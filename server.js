//DEPENDENCIES
var express = require('express'),
	app = express(),
	bodyParser = require ('body-parser'),
	mongoose = require('mongoose'),
	
	engine = require('ejs-locals'),

	signUpCntrl = require('./server/controllers/signUpCntrl.js'),
	models = require('./server/models/userModels.js'),
	routes = require('./routes'),
	User,

	session = require ('express-session'),
	mongoStore = require ('connect-mongo')(session),

	passport = require ('passport'),
	FacebookStrategy = require ('passport-facebook').Strategy,
	TwitterStrategy = require ('passport-twitter').Strategy,
	GooglePlusStrategy = require('passport-google-plus'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,

	google = require ('googleapis'),
	OAuth2 = google.auth.OAuth2,

	clientID = '745976798389-120ogep7g9a9epojftd36q7sthhcgfc1.apps.googleusercontent.com',
    clientSecret = 'R718cA76TvvoztAsuGOJJA1o',
    callbackURL= 'http://localhost:5000/authorizegoogle/callback',
	oauth2Client = new OAuth2(clientID, clientSecret, callbackURL),
	scopes = ['https://www.googleapis.com/auth/drive'],
	authUrl = oauth2Client.generateAuthUrl({
		scope: scopes
	});


//VIEWER
app.engine('ejs', engine);
app.set('view engine', 'ejs');

//MONGO SETUP
mongoose.connect('mongodb://localhost:27017/testApp_0');

//BODY PARSER
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

//PASSPORT
app.use(passport.initialize());

//Google APIS
google.options({auth: oauth2Client}); 
var drive = google.drive({version: 'v2'});

//SESSION (OPTIONAL) *------------------
app.use(session({
  	secret: 'keyboard Dog',
  	saveUninitialized: true,
	resave: true,
	store: new mongoStore({
		db: 'testApp_0',
		host: 'localhost',
		port: 27017
  	})
}));
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
//*---------------------------------------


//PASSPORT STRATEGIES: new Strategy({info}, callbackfunction);
passport.use(new FacebookStrategy({
	clientID: '1604949299716761',
	clientSecret: '5ad68897b7c0c28f12696470e33710ea',
	callbackURL: 'http://localhost:5000/signupfacebook/callback'

}, function (accessToken, refreshToken, profile, done) {
	session.id = profile.id;
	userGenerateCheck(profile, null, models, done);
	})
);
passport.use(new TwitterStrategy({
	consumerKey: 'pLFQ2T0vNXzlZLQjETTOlzIkE',
	consumerSecret: 'MetHmrZFvSEvjuvnpwP8VwAKM7ca21iwv1jNbplJSh6emUAFLO',
	callbackURL: 'http://localhost:5000/signuptwitt/callback'

}, function (accessToken, refreshToken, profile, done) {
		session.id = profile.id; 
		userGenerateCheck(profile, null, models, done);
	})
);
//STATICS
app.use('/client', express.static('client')); 
app.use('/bower_components', express.static('bower_components')); 
app.use('/views/templates', express.static('views/templates')); 

//API
	//PAGES	
	app.get('/', function (request, response) {
		response.render('index'); 
	}); 

	//MONGO
	app.get('/list', signUpCntrl.listUsers);
	app.get('/clear', signUpCntrl.clearCollection);

	app.post('/signup', signUpCntrl.createUser);

	//SOCIAL MEDIA AUTH
	app.get('/signuptwitt', passport.authenticate('twitter'));
	app.get('/signuptwitt/callback', passport.authenticate('twitter', {failureRedirect: '/'}), function (request, response) {
		response.location('/');
	});

	app.get('/signupfacebook', passport.authenticate('facebook'));
	app.get('/signupfacebook/callback', passport.authenticate('facebook', {failureRedirect: '/'}), function (request, response) {
		response.location('/');
	});

	app.get('/authorizegoogle', function (request, response) {
		response.redirect(authUrl);
	});
	app.all('/authorizegoogle/callback' , function (request, response) {
		oauth2Client.getToken (request.query.code , function(err, tokens) {
			if (!err) {
				if (session.id !== undefined){
					addAccessToken (models, session.id, tokens.access_token); 
					session.accessToken = tokens.access_token; 
				}
				oauth2Client.setCredentials(tokens);
			}
		});
	});

	//MISC/TESTING

	app.get('/authenticated', function (request, response) {response.send('Authenticated');});

	app.get('/logout', function (request, response) {
		request.logout();
		console.log('loggedOut');
	});

	app.get('/testingparams', function (request, response) {
		response.send(request.query.sampletext);
	});

	app.get('/listdrivefiles', listDriveFiles);
	app.post('/watchdrivefiles', watchDriveFiles);

//LITSENER
app.listen(5000, function (){
	console.log('litsening'); 
}); 

//TODO NEXT:
/*
Endpoint watch files and respond with changes

1i3CmXhR1K-P1HkBE7MeBRZvZiXD-qtA2BGjfT0_3ntE
*/

function userGenerateCheck (profile, accessToken, models, done) {
	models.user.find ({_id: profile.id}, function (err, results) {
		if (results[0] === undefined) {
			paramsArray = ["id", "email", "username", "displayName", "password"];
			for (var key in paramsArray) {
				if (profile[paramsArray[key]] === undefined) {
					profile[paramsArray[key]] = ""; 
				}
			}
			User = new models.user({_id: profile["id"], email: profile["email"], username: profile["username"], displayName: profile["displayName"], password: profile["password"], accessToken: accessToken});
			User.save (function (err, result) {
				if (err){console.log("ERROR: " + err);}
			});
		}
		else{
			console.log('User Already Exists');
		}
		return done(err, profile);
	});
}

function addAccessToken (models, currentUserID, accessToken) {
	models.user.update(
		{_id: currentUserID}, 
		{$set: {
			accessToken: accessToken
		}},
		function (err, results) {
			if (err) {console.log(err);}
		}
	)
}
function ensureAuthenticated (request, response, next) {
	if (request.isAuthenticated()) {return next();}
	response.redirect('/'); 
}
function listDriveFiles (request, response) {
	//request.accepts('html');
	drive.files.list(function (err, result){
			if (!err) {
				response.send(result); 
			}else{
				response.send(err);
			}
		});
}
function watchDriveFiles (request, response) {
	drive.files.watch({fileId: request.query.fileId}, function (err, result) {
		if (!err) {
			response.send(result); 
		}else{
			response.send(err); 
		}
	});
}

