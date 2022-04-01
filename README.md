# Athletics Day Score Tracking Software

This software allows a school or similar institution to create a fast, easily accessible digital record of the results of events that occur at an event such as an athletics day. The data can be entered from mobile devices, as the website developed is (mostly) mobile friendly.

There are 6 main components of the software. They are:
 - Database (SQLite3)
 - API (Node.js)
 - Data entry website (HTML/CSS/JS/Bootstrap)
 - Admin website (HTML/CSS/JS/Bootstrap)
 - Points website (HTML/CSS/JS)
 - caddy server (reverse proxy + static serving)

## Usage
Edit the `Caddyfile`, replacing `localhost` with the IP or domain you expect people to be accessing it on. Then:
```sh
docker-compose up -d
```
Should be all that's needed, on a linux machine with `docker-compose` installed. It will then be accessible through `localhost` and auto-negotiate for an https certificate is one is available. When this command is run, **the database is refreshed**. To persist data, first copy the `athletics.db` file out of the `backend` folder, and that will contain the information. It can be explored using an SQLite3 database explorer.

Logs can be checked with `docker-compose logs -f`, and it can be stopped with `docker-compose down`. The `-d` flag on startup detaches it from the current shell, allowing it to be run in the background.

Running it locally will show a "Security Error" because TLS certificates aren't available for local addresses. Browsers in this case should allow you to bypass. Ideally, when set up on a static IP/domain, this won't be seen.

## Endpoints
 - `/` shows the current point status
 - `/admin` allows someone to edit students, houses, and events
 - `/data-entry` allows someone to update placings and participation in events.
