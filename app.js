require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { asyncLocalStorage, integrationGenerateContext } = require('./config/context');
const { integrationAttachResponseBody, integrationAttachContext } = require('./config/httpLogger');

const app = express();
const cors = require('cors')
app.use(cors({
	origin: '*',
	methods: [
		'GET',
		'POST',
		'PUT',
		'PATCH',
		'DELETE',
		'OPTIONS'
	],
	allowedHeaders: [
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		'Authorization'
	]
}))

app.use(integrationAttachResponseBody);
app.use(integrationGenerateContext);
app.use(integrationAttachContext);

app.use(express.json({ type: 'application/json', limit: '100mb', parameterLimit: 100000, extended: true }));
app.use(express.urlencoded({ limit: '100mb', parameterLimit: 100000, extended: true }));
app.use(express.text());
app.use(helmet());

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
		return res.json({
			message: "request not permitted",
			error: true,
		});
	}
	next();
});

app.use('/', require('./routes'));

app.use((req, res) => {
	res.status(404).json({
		message: 'Route Not Found',
		error: true,
	});
});

app.use((err, req, res, next) => {
	console.error(err);

	res.status(err.status || 500).json({
		message: err.message || 'Internal Server Error',
		error: true,
	});
});

module.exports = app;