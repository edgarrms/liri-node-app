require("dotenv").config();
let fs = require("fs");
let axios = require("axios");
let keys = require("./keys.js");
let moment = require('moment');
moment().format();
let omdb = keys.omdb;
let bandsintown = keys.bandsintown;
let spotify = keys.spotify;
const client_id = spotify.id;
const client_secret = spotify.secret;

let operator = process.argv[2];
let queryArr = process.argv.slice(3);
let logIt = "[" + moment().format("MM/DD/YYYY h:mm:ss a") + "] " + process.argv.slice(2).join(" ");
doSomething();

function doSomething() {
    if (operator == "do-what-it-says") {
        let random = fs.readFileSync("./random.txt", "utf8");
        random = random.trim().split(",");
        operator = random[0];
        queryArr = [random[1]];
        logIt += " = " + operator + " " + queryArr;
    }
    if (operator == "concert-this") {
        concertSearch();
    } else if (operator == "spotify-this-song") {
        getSpotifyData(client_id, client_secret);
    } else if (operator == "movie-this") {
        movieSearch();
    } else {
        console.log(`---------------------------------`);
        console.log("To use liri type one of these commands");
        console.log("(concert-this, spotify-this-song, movie-this, do-what-it-says)");
        console.log("than type in the search option.");
        console.log('example "node liri spotify-this-song morado"');
        console.log(`---------------------------------`);
    }
    logIt += "\n";
    fs.appendFile("./log.txt", logIt, err => { if (err) console.log(err) });
}

function concertSearch() {
    let query = "";
    for (let c in queryArr) {
        query += queryArr[c].replace(/\s/g, "%20");
        query += "%20";
    }
    query = query.replace(/%20\b/, "");
    let queryURL = "https://rest.bandsintown.com/artists/" + query + "/events?app_id=" + bandsintown.id;

    axios.get(queryURL).then(function (response) {
        // console.log(response.data);
        console.log(`---------------------------------`);
        if (response.data[0] == undefined) {
            console.log("no artist, wait but also no show...hmmm weird, ya know!");
            console.log(`---------------------------------`);
        } else {
            for (let d = 0; d < 3; d++) {
                let date = moment(response.data[d].datetime).format("LL");
                console.log(`Venue | ${response.data[d].venue.name}`);
                console.log(`City  | ${response.data[d].venue.city}, ${response.data[d].venue.region}, ${response.data[d].venue.country}`);
                console.log(`Date  | ${date}`);
                console.log(`---------------------------------`);
            }
        }
    });
}

function getToken(client_id, client_secret) {
    return axios({
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        params: {
            grant_type: 'client_credentials'
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
            username: client_id,
            password: client_secret
        }
    });
}


async function getSpotifyData(client_id, client_secret) {
    const tokenData = await getToken(client_id, client_secret);
    const token = tokenData.data.access_token;

    let query = "";
    for (let s in queryArr) {
        query += queryArr[s].replace(/\s/g, "%20");
        query += "%20";
    }
    query = query.replace(/%20\b/, "");
    let queryURL = "https://api.spotify.com/v1/search?q=" + query + "&type=track&limit=3";

    axios({
        url: queryURL,
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(response => {
        console.log(`---------------------------------`);
        for (let t = 0; t < 3; t++) {
            console.log(`Artist    | ${response.data.tracks.items[t].artists[0].name}`);
            console.log(`Song Name | ${response.data.tracks.items[t].name}`);
            console.log(`Album     | ${response.data.tracks.items[t].album.name}`);
            console.log(`Preview   | ${response.data.tracks.items[t].preview_url}`);
            console.log(`---------------------------------`);
        }
        return response.data;
    }).catch(error => {
        console.log("INVALID SONG TITLE");
        console.log(`---------------------------------`);
        return error;
    });
}

function movieSearch() {
    let query = "";
    for (let c in queryArr) {
        query += queryArr[c].replace(/\s/g, "+");
        query += "+";
    }
    query = query.replace(/\+$/, "");
    if (query == "") {
        query = "Mr.+Nobody";
    }
    let queryURL = "https://www.omdbapi.com/?t=" + query + "&y=&plot=short&apikey=" + omdb.key;

    axios.get(queryURL).then(function (response) {
        // console.log(response.data);
        console.log(`---------------------------------`);
        if (response.data.Response == 'False') {
            console.log("INVALID MOVIE TITLE");
            console.log(`---------------------------------`);
        } else {
            console.log(`Title                  | ${response.data.Title}`);
            console.log(`Year                   | ${response.data.Year}`);
            console.log(`IMDB Rating            | ${response.data.Ratings[0].Value}`);
            console.log(`Rotten Tomatoes Rating | ${response.data.Ratings[1].Value}`);
            console.log(`Country                | ${response.data.Country}`);
            console.log(`Language               | ${response.data.Language}`);
            console.log(`Plot                   | ${response.data.Plot}`);
            console.log(`Actors                 | ${response.data.Actors}`);
            console.log(`---------------------------------`);
        }
    });
}