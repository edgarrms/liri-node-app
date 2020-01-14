var Spotify = require('node-spotify-api');
var moment = require('moment');
var request = require("request");
const dotenv = require("dotenv").config();
var fs = require('fs');
const keys = require("./keys");
var spotify = new Spotify(keys.spotify);
const bandsInTown = keys.bandsInTown;
const OMDB = keys.OMDB;

if (process.argv[2]) {
    let optionToSelect = process.argv[2];
    if (process.argv[3]) {
        process.argv.shift();
        process.argv.shift();
        process.argv.shift();
        var aQuery = process.argv.join(' ');
    }

    selectingTheOporation(optionToSelect, aQuery);
} else appendsInfo('no arguments supplied');

function selectingTheOporation(Selected, aQuery) {
    if (Selected === 'concert-this') {
        searchBandsInTown(aQuery);
    } else if (Selected === 'spotify-this-song') {
        searchSpotify(aQuery);
    } else if (Selected === 'movie-this') {
        searchOMDB(aQuery);
    } else if (Selected === 'do-what-it-says') {

        fs.readFile('random.txt', 'utf8', function (err, data) {
            if (err) throw err;
            let thisData = data.split(',');
            let test = thisData[1].substring(thisData[1].indexOf('"') + 1, thisData[1].lastIndexOf('"'));
            selectingTheOporation(thisData[0], test);
        });
    }
}

function searchBandsInTown(artist) {
    if (!artist) artist = 'Third Eye Blind';
    request(`https://rest.bandsintown.com/artists/${encodeURI(artist)}/events?app_id=codingbootcamp`,
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                body = JSON.parse(body);
                appendsInfo(`Results for ${artist}`);

                for (let i = 0; i < body.length; i++) {
                    let time = moment(body[i].datetime).format('MM/DD/YYYY');
                    appendsInfo(`Venue: ${body[i].venue.name}`);
                    appendsInfo(`Location: ${body[i].venue.city}, ${body[i].venue.region}, ${body[i].venue.country}`);
                    appendsInfo(`Date: ${time}`)
                }
            }
        });
}

function searchOMDB(movie) {
    if (!movie) movie = 'Mr. Nobody';
    request(`http://www.omdbapi.com/?t=${encodeURI(movie)}&y=&plot=short&apikey=${OMDB.id}`,
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                body = JSON.parse(body);
                let rating = "Not Available";
                appendsInfo(`Title: ${body.Title}`);
                appendsInfo(`Release Year: ${body.Year}`);
                appendsInfo(`IMDB Rating: ${body.imdbRating}`);
                for (let i = 0; i < body.Ratings.length; i++) {
                    if (body.Ratings[i].Source === 'Rotten Tomatoes')
                        rating = body.Ratings[i].Value;
                }
                appendsInfo(`Rotten Tomatoes Rating: ${rating}`);
                appendsInfo(`Produced in: ${body.Country}`);
                appendsInfo(`Language: ${body.Language}`);
                appendsInfo(`Plot: ${body.Plot}`);
                appendsInfo(`Actors: ${body.Actors}`);
            }
        });
};

function searchSpotify(song) {
    if (!song) song = 'Coldplay hym for the weekend';
    spotify.search({ type: 'track', query: song }, function (err, data) {
        if (err) {
            return appendsInfo('Error occurred: ' + err);
        }
        appendsInfo(`Artist(s): ${data.tracks.items[0].artists[0].name}`);
        appendsInfo(`Song Title: ${data.tracks.items[0].name}`);
        appendsInfo(`Preview Link: ${data.tracks.items[0].external_urls.spotify}`);
        appendsInfo(`Album of Track: ${data.tracks.items[0].album.name}`);
    });
}

function appendsInfo(content) {
    fs.appendFile('log.txt', content + '\n', function (err) {
        if (err) throw err;
        console.log(content);
    });
}