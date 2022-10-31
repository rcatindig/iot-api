'use strict';
const sql = require("../helpers/database");
const moment = require("moment");

// Constructor
const Feedback = function (feedback) {
    this.id = feedback.id;
    this.opeartorId = feedback.operator_id;
    this.questionText = feedback.question_text;
    this.questionType = feedback.question_type;
    this.status = feedback.status;
};

Feedback.getQuestionsWithOperatorId = (operatorId, callback) => {
    let query = "SELECT * FROM feedback_questions WHERE operator_id = ?"
    sql.query(query, [operatorId], (error, questions) => {
        if (error) {
            console.log("Failed to get questions: ", error);
            callback("Failed to get questions", null);
            return;
        }

        if (questions.length == 0) {
            console.log("No questions were fetched")
            callback(null, [])
            return;
        }

        console.log("Successfully fetched questions")
        callback(null, questions);
    })
}


Feedback.getOptionsWithOperatorId = (operatorId, callback) => {
    let query = `SELECT question.id AS question_id, question.operator_id,
                    opt.id AS option_id, opt.title, opt.text
                FROM feedback_questions question, feedback_options opt
                WHERE question.id = opt.question_id
                AND question.operator_id = 1;`
    sql.query(query, [operatorId], (error, options) => {
        if (error) {
            console.log("Failed to get question options: ", error);
            callback("Failed to get question options", null);
            return;
        }

        if (options.length == 0) {
            callback(null, []);
            return;
        }

        console.log("Successfully question options")
        callback(null, options);
    })
}


Feedback.getOptionsWithQuestionId = (questionId, callback) => {
    let query = "SELECT * FROM feedback_options WHERE question_id = ?"
    sql.query(query, [questionId], (error, results) => {
        if (error) {
            console.log("Failed to get question options: ", error);
            callback("Failed to get question options", null);
            return;
        }

        if (results.length == 0) {
            callback(null, "");
            return;
        }

        console.log("Successfully question options")
        callback(null, results);
    })
}

Feedback.saveAnswers = (purchaseId, answers, callback) => {
    const dateCreated = moment().format("YYYY-MM-DD HH:mm:ss");
    const values = []

    answers.forEach(answer => {
        let arr = Object.values(answer);
        arr = [...arr, purchaseId, global.deviceId, dateCreated]
        values.push(arr)
    });

    let query = "INSERT INTO feedback_answers (question_id, option_id, free_text_answer, purchase_id, device_id, created_at) VALUES ?"
    sql.query(query, [values], (error, results) => {
        if (error) {
            console.log("Failed to save answers: ", error);
            callback("Failed to save answers", null);
            return;
        }

        console.log("Successfully saved answers")
        callback(null, "Successfully saved answers");
    })
}

module.exports = Feedback;