const Feedback = require('../models/Feedback')
const Vehicle = require('../models/Vehicle')

// FETCH QUESTIONS
exports.getQuestions = (req, res) => {

    // TODO PROMISIFY THESE QUERIES
    // https://stackoverflow.com/questions/54730641/node-js-how-to-apply-util-promisify-to-mysql-pool-in-its-simplest-way
    Vehicle.getOperatorId((err, operatorId) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        if (operatorId.length == 0) {
            console.log("No operator ID was found")
            res.status(400).send({ error: "No operator ID was found" })
            return;
        }

        Feedback.getQuestionsWithOperatorId(operatorId, (err, questions) => {
            if (err) {
                res.status(500).send({ error: err })
                return;
            }

            if (questions.length == 0) {
                console.log("No Questions were fetched")
                res.status(400).send({ error: "No Questions were fetched" })
                return;
            }

            Feedback.getOptionsWithOperatorId(operatorId, (err, options) => {
                if (err) {
                    res.status(500).send({ error: err })
                    return;
                }

                if (options.length == 0) {
                    console.log("No options were fetched")
                    res.status(400).send({ error: "No options were fetched" })
                    return;
                }
                
                // JUST PUTTING IT HERE. I don't understand why the original devs didn't create a table with a 
                // column -  with enum values instead... 
                // NOTE:
                // question_type VALUES: 
                // 1 - Multiple Choice, 
                // 2 - Free Text

                const survey = questions

                for (var i = 0; i < survey.length; i++) {
                    for (var j = i; j < options.length; j++) {
                        let question = survey[i];
                        let option = options[j];
                        if (option.question_id == question.id) {
                            if (question.options == undefined) {
                                question.options = [option];
                            } else {
                                question.options.push(option);
                            }
                        }
                    }
                }

                res.send({ data: { survey: survey } })
            })
        })
    })
}


exports.saveAnswers = (req, res) => {

    const { purchaseId, answers } = req.body

    if (purchaseId == undefined || purchaseId == null || purchaseId.length == 0) {
        res.status(400).send({ error: "purchaseId is required" })
        return;
    } else if (answers == undefined || answers == null || answers.length == 0) {
        res.status(400).send({ error: "answers object is required" })
        return;
    }

    Feedback.saveAnswers(purchaseId, answers, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { message: result } });
    })

}

