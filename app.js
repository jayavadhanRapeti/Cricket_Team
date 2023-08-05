const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDbAndServer();

const convertDbResponse = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersDetails = `
    SELECT
        *
    FROM
        cricket_team
    ORDER BY
        player_id`;
  const playersDetails = await db.all(getPlayersDetails);
  response.send(
    playersDetails.map((eachPlayer) => convertDbResponse(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayer = `
    INSERT INTO
        cricket_team(player_name,jersey_number,role)
    VALUES
        (
            '${playerName}',
            '${jerseyNumber}',
            '${role}'
        );
    `;

  const dbResponse = await db.run(addPlayer);
  response.send("Player Added to Team");
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playersDetails = `
    SELECT
        *
    FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;
  const playersArray = await db.get(playersDetails);
  response.send(convertDbResponse(playersArray));
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayer = `
    UPDATE
        cricket_team
    SET
        player_name= '${playerName}',
        jersey_number= '${jerseyNumber}',
        role= '${role}'
    WHERE
        player_id = ${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
