const express = require("express");
const router = express.Router();
const db = require("../config/db");

// SEND MESSAGE
router.post("/send", (req, res) => {
  const { sender_id, receiver_id, sms, image } = req.body;

  if (!sender_id || !receiver_id) {
    return res.json({
      success: false,
      message: "Sender and Receiver required"
    });
  }

  if (!sms && !image) {
    return res.json({
      success: false,
      message: "Message or image required"
    });
  }

  db.query(
    "INSERT INTO messages (sender_id,receiver_id,sms,image) VALUES (?,?,?,?)",
    [sender_id, receiver_id, sms || null, image || null],
    (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        message: "Message sent",
        data: {
          id: result.insertId,
          sender_id,
          receiver_id,
          sms,
          image
        }
      });
    }
  );
});

// GET CHAT
router.get("/:sender/:receiver", (req, res) => {
  const { sender, receiver } = req.params;

  db.query(
    `SELECT * FROM messages 
     WHERE (sender_id=? AND receiver_id=?) 
     OR (sender_id=? AND receiver_id=?)
     ORDER BY createdAt ASC`,
    [sender, receiver, receiver, sender],
    (err, data) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        data,
        message: "Chat fetched"
      });
    }
  );
});


router.post("/start", (req, res) => {
  const { caller_id, receiver_id, type } = req.body;

  if (!caller_id || !receiver_id || !type) {
    return res.json({
      success: false,
      message: "All fields required"
    });
  }

  db.query(
    "INSERT INTO calls (caller_id,receiver_id,type,startTime) VALUES (?,?,?,NOW())",
    [caller_id, receiver_id, type],
    (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        message: "Call started",
        data: {
          call_id: result.insertId
        }
      });
    }
  );
});

router.post("/end", (req, res) => {
  const { call_id } = req.body;

  db.query(
    "UPDATE calls SET status='ended', endTime=NOW() WHERE id=?",
    [call_id],
    (err) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        message: "Call ended"
      });
    }
  );
});

router.post("/update-status", (req, res) => {
  const { call_id, status } = req.body;

  db.query(
    "UPDATE calls SET status=? WHERE id=?",
    [status, call_id],
    (err) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        message: "Call status updated"
      });
    }
  );
});



module.exports = router;