

const { Telegraf, Markup, Context } = require("telegraf");
const BOT = new Telegraf(process.env.TOKEN);

let users = []
let bottoni = [['Pause', 'Intervallo']];
let optionmessage = 
`${randomResponse("greetings")}, vuoi *modificare* qualche opzione?
            
Di *defaul* ogni 25 minuti avrai una pausa di 5 minuti e alla *fine del pomodoro* potrai effettuare una pausa di 10 minuti\\.

*Puoi cambiare* il lasso di tempo a tuo piacimento ti basterà cliccare il relativo bottone e poi *scrivere il lasso di tempo in MINUTI*\\.`



/**
. Returns a random string from the input array.
. @param {Array} arr The input array.
. @param {number} length The length of the input array.
. @return {string} A randomly selected string from the input array.
*/

function randomResponse(typeOfMessAge)
{
    let greetings = [`Hey \u{1F601}`, `Ciao \u{1F609}`, `Bellaa \u{1F60E}`, `Hola \u{1F604}`];
    let startPauseMessage = [`Smetti di lavorare e goditi la tua meritata pausa \u270C`, `Ti vedo stanco, che ne dici una pausa? \u2615`, `Drinnnnnnnnn, è ora di una pausa \u23F0`, `Auto distruzione ATTIVATA \u{1F4A3}, ...no scherzo devi solo fare una pausa`];
    let endPauseMessage = [`La pacchia è finita pigrone, devi ricominciare a lavorare \u{1F4BB}`, `Lo so, è dura ma devi ricominciare a lavorare \u{1F4AA}`, `Era buono il caffè? ora visogna ricomiciare a lavorare \u{23F3}`, `Daiii, è ora di ricominciare a lavorare i \u{1F4B8} non cadono dal cielo`]

    function randomString(arr, length)
    {
        let string = arr[Math.floor(Math.random() * length)];

        return string;
    }

    if (typeOfMessAge === "greetings")
    {
        return randomString(greetings, greetings.length);
    }
    else if(typeOfMessAge === "startPauseMessage")
    {
        return randomString(startPauseMessage, startPauseMessage.length);
    }
    else if(typeOfMessAge === "endPauseMessage")
    {
        return randomString(endPauseMessage, endPauseMessage.length);
    }

}


/**
. Converts an integer to sessagesimal format.
. @param {number} message The integer to convert.
. @return {number} The converted sessagesimal number.
*/

function intToSessagesimal(message)
{   
    let sessagesimalNum = Number(message) * 60000;
    return sessagesimalNum
}

/**
.	Checks if the given element matches the check element or the other check element. If it matches, the given function is executed with the corresponding parameter.
.	@param {any} element The element to check.
.	@param {any} checkElement The first element to compare.
.	@param {any} otherCheckElement The second element to compare.
.	@param {function} run The function to execute if there is a match.
.	@param {any} param The parameter to pass to the function if element matches checkElement.
.	@param {any} otherParam The parameter to pass to the function if element matches otherCheckElement.
.	@return {void}
*/

function checkElementAndRun(element, checkElement, otherCheckElement, run, param, otherParam)
{
    if (element === checkElement)
    {
        run(param)
    }
    else if(element === otherCheckElement)
    {
        run(otherParam)
    }
}

/**
.	Checks if a user is already registered in the system, and adds them if they are not.
.	@param {object} obj - The user object to check and potentially add to the system.
.	@return {void} - This function does not return anything, but modifies the 'users' array.
*/

function isRegistered(obj)
{
    if (users.length > 0)
    { 
        let registered = 0
        users.forEach((user) =>
        {
            if (user.id !== obj.id)
            {
                registered++
                if (registered === users.length)
                {
                    users.push(obj);
                }
            }
        })
    }
    else if(users.length === 0)
    {
        users.push(obj);
    }
}

/**
. Starts the bot and initializes a user object with default values.
. @param {Object} ctx The context object passed to the callback function.
*/
BOT.start((ctx) => 
{
	/**
	.	Object that represents a user with their settings and methods for a pomodoro timer.
	.	@param {string} name - The user's first name.
	.	@param {number} id - The user's unique id.
	.	@param {number} timer - The time in milliseconds for the pomodoro timer.
	.	@param {number} tSmallBreack - The time in milliseconds for a short break.
	.	@param {object} helpers - An object that contains helper properties and methods.
	.	@param {number} helpers.counter - A counter to keep track of the number of pomodoros completed.
	.	@param {string} helpers.discriminateElement - A string to help distinguish between updating the duration of the pomodoro or break.
	.	@param {number} helpers.optionModified - A counter to keep track of how many options the user has modified.
	.	@param {function} userTimeout - A function to set a timeout for either the pomodoro timer or the break timer.
	.	@param {string} typeOfTimeout - A string that determines whether the timeout is for the pomodoro or break.
	.	@param {object} ctx - The context of the user's message.
	.	@param {function} userTomato - A function that checks if the user has completed 4 pomodoros and starts a break or ends the pomodoro session.
	.	@param {function} setOption - A function to set options for the pomodoro timer.
	.	@param {function} setTime - A function to set the duration for the pomodoro and break times.
	*/
    
    let userObject = 
    {
        name: ctx.message.from.first_name,
        id: ctx.message.from.id,
        timer: 1500000,
        tSmallBreack: 300000,
        helpers: 
        {
            counter: 0,
            discriminateElement: "",
            optionModified: 0
        },


        userTimeout: function (typeOfTimeout, ctx)
        {
            if(typeOfTimeout === "timer")
            {
                setTimeout(()=>
                {
                    this.helpers.counter++;
                    this.userTomato(ctx);
                }, this.timer);
            }
            else
            {
                ctx.sendMessage(randomResponse("startPauseMessage"));
                
                setTimeout(()=>
                {
                    ctx.sendMessage(randomResponse("endPauseMessage"));
                    this.userTimeout("timer", ctx);
                }, this.tSmallBreack);
            }

        },

        userTomato: function (ctx)
        {
            if (this.helpers.counter <= 4)
            {
                this.userTimeout("breack", ctx);
            }
            else
            {
                this.helpers.counter = 0
                ctx.sendMessage("fine");
            };
        },

        setOption: function (ctx)
        {
            ctx.replyWithMarkdownV2(optionmessage, Markup.keyboard(bottoni).oneTime().resize())
            
            BOT.hears(['Pause','Intervallo', 'pause', 'intervallo'], (ctx) => 
            {
                this.helpers.discriminateElement = ctx.message.text.toLowerCase();
               
                function response(message)
                {
                    ctx.replyWithMarkdownV2(message)
                }

                let message = "\u{1F44C} Indicami *quanto dovranno essere lunghe le pause*\\.\nTi basterà inviarmi un *messaggio* indicando *solamente il numero di MINUTI*\\. Es\\. 10";
                let otherMessage = "\u{1F44C} Indicami *ogni quanto vorrai fare la pausa*\\.\nTi basterà inviarmi un *messaggio* indicando *solamente il numero di MINUTI*\\. Es\\. 10"; 
                
                checkElementAndRun(this.helpers.discriminateElement, 'pause', 'intervallo', response, message, otherMessage);
                this.setTime();
            });
        },

        setTime: function()
        {
            BOT.hears(Number, (ctx)=> 
            {
				
				/**
				. @param {Array} param - An array that contains information about the function execution.
				. @param {object} param[0] - The userObject.
				. @param {string} param[1] - The message to send as a reply.
				. @param {Array} param[2] - An array of buttons to display in the message.
				. @returns {undefined}
				*/


                function setOptionAndResponse(param)
                {
                    param[0].helpers.optionModified++
                    param[2][0] === "Intervallo" ? param[0].timer = intToSessagesimal(ctx.message.text) : param[0].tSmallBreack = intToSessagesimal(ctx.message.text)
                    
                    if(userObject.helpers.optionModified < 2)
                    {
                        ctx.replyWithMarkdownV2(param[1], Markup.keyboard(param[2]).oneTime().resize());
                    }
                    else if(userObject.helpers.optionModified >= 2)
                    {
                        button = ["Play", "/option"]
                        ctx.replyWithMarkdownV2(`\u2705 Tutte le ipostazioni sono state modificare\\.\nPremi *Play* se vuoi far partire il pomodoro\nSe hai sbagliato ad inserire quallche opzione premi *Option* per ricominciare\\.`, Markup.keyboard(button).oneTime().resize());
                    }

                }

                let intervalParam = [this, `Ok, valore aggiornato, *ogni ${ctx.message.text} minuti* potrai effettuare una pausa \u2705\\.\n*Premi Pause* se vuoi *aggiornare* anche la durata delle pause\\.`, ["Pause"]]
                let pauseParam = [this, `Ok, valore aggiornato, *le pause dureranno ${ctx.message.text} minuti* \u2705\\.\n*Premi Intervallo* se vuoi *aggiornare* anche la durata dell' intervallo\\.`, ["Intervallo"]]
                
                checkElementAndRun(this.helpers.discriminateElement, 'pause', 'intervallo', setOptionAndResponse, pauseParam, intervalParam);
                this.helpers.discriminateElement = ""

            });

            bot.hears(String, (ctx)=> ctx.replyWithMarkdownV2("\u274C Il valore inserito *non è* un *numero*\\."))
        }
    }

    isRegistered(userObject)

    ctx.replyWithMarkdownV2(`${randomResponse("greetings")}, ${ctx.message.from.first_name}, *tomaBot* \u{1F34e} ti da il benvenuto\\.\n\n*Premi /option* per modificare l'intervallo tra le pause e la durata della pausa, di default ogni 25 minuti avrai una pausa di 5\\.\n\n*Digita Play* se vuoi far partire il pomodoro\\.`);
    console.log(users);
});

/**
 * Handle the "/option" command from the user
 * @param {Context} ctx - The context object representing the Telegram message received
 */

BOT.command((ctx)=>{'/option',

    users.forEach((user)=>
    {
        if(ctx.message.from.id === user.id)
        {
            user.helpers.optionModified = 0;
            user.setOption(ctx);
        };
    });
});

/**
 * Handles the 'play' command when received from a user.
 * Starts the tomato timer for the user who sent the command.
 * @param {Object} ctx - The context object for the Telegram message.
 */

BOT.hears(['play', 'Play'], (ctx) => 
{
    users.forEach((user)=>
    {
        if(ctx.message.from.id === user.id)
        {
            ctx.reply("Ok, incomincia a lavorare")
            user.userTimeout("timer", ctx);
            console.log(user);
        };
    });
});

BOT.launch();
