const LOADING_SCREEN_DIV = $('#loading-screen-div');
const POST_IT_CONTAINER = $('#post-it-container');
const RESULT_CONTAINER = $('#result-container');
const colors = [
    {
        base: '#FFED02',
        corner: '#FEF680',
        border: '#E0CD01'
    },
    {
        base: '#FEAC16',
        corner: '#FFBE4C',
        border: '#D59014'
    },
    {
        base: '#5FC8FF',
        corner: '#8BD7FF',
        border: '#41B1DF'
    }
];
const correct_color = '#858687';
const default_answer_color = '#262B32';
const API_URL = 'https://the-trivia-api.com/questions?limit=4';
const loading_screen_strings = ['Removing old post-its.','Scraping adhesive.','Buying office supplies.','Cleaning white board.','Placing new post-its.','Writing questions.','Spilling coffee on work area...','Starting over.'];
const questions = [null,null];
let interval_id = null;
let getSetAnswerCount = null;

const handleInitialSetup = async () => {
    startLoadingScreen();
    getSetAnswerCount = handleAnswerCount();
    post_its = POST_IT_CONTAINER.children();
    for (let i = 4; i--;)
        post_its.eq(i).children('.front').eq(0).on('click',e => e.currentTarget.parentNode.classList.add('selected'));
    try
    {
        questions[1] = await getQuestions();
        setUpPostIts();
        stopLoadingScreen();
    }
    catch(err)
    {
        console.log(err);
    }
}

const handleAnswerCount = (correct = 0, incorrect = 0) => (b) => b ? [++correct,incorrect] : [correct,++incorrect];

const startLoadingScreen = () => {
    let updateLoadingScreenMessage = setLoadingScreenText();
    updateLoadingScreenMessage();
    interval_id = setInterval(updateLoadingScreenMessage,800);
}

const stopLoadingScreen = () => {
    clearInterval(interval_id);
    LOADING_SCREEN_DIV.addClass('remove');
}

const setLoadingScreenText = (loading_screen_index = 0) => () => {
    let text = loading_screen_strings[loading_screen_index++];
    if (!(loading_screen_index < loading_screen_strings.length))
        loading_screen_index = 0;
    LOADING_SCREEN_DIV.text(text);
}

const getQuestions = () => {
    return fetch(API_URL).then(res => res.json());
}

const handleAnswerClick = correct => (e) => {
    let [_correct,_incorrect] = getSetAnswerCount(correct);
    RESULT_CONTAINER.children().eq(0).text('correct: ' + _correct);
    RESULT_CONTAINER.children().eq(1).text('incorrect: ' + _incorrect);
    let correct_answer;
    if (correct)
    {
        correct_answer = e.currentTarget;
        correct_answer.classList.add('correct');
    }
    else
    {
        let nodes = e.currentTarget.parentNode.children;
        for (let i = 4; i--;)
        {
            if (nodes[i].is_correct)
            {
                delete nodes[i].correct_answer;
                correct_answer = nodes[i];
                correct_answer.classList.add('correct');
            }
        }
    }
    setTimeout(() => {
        correct_answer.classList.remove('correct');
        setUpPostIts();
    },2000);
}

const setUpPostIts = () => {
    questions[0] = questions[1];
    getQuestions().then(res => questions[1] = res);
    let qstns = questions[0];
    let post_its = POST_IT_CONTAINER.children();
    for (let i = 4; i--;)
    {
        let random_index = Math.round(Math.random() * 3);
        let data = qstns[i];
        let post_it = post_its.eq(i);
        post_it.removeClass('selected');
        let color = colors[Math.round(Math.random() * (colors.length - 1))];
        post_it
        .css('background',`linear-gradient(135deg, ${color.base} 0%, ${color.base} 80%, ${color.corner} 81%, ${color.corner} 100%)`)
        .css('border','5px solid ' + color.border);
        let front = post_it.children('.front').eq(0);
        let back = post_it.children('.back').eq(0);
        front.text(data.category);
        back.children('.question').text(data.question);
        let answer_elems = back.children('.answer-container').eq(0).children().off();
        for (let i = 0, l = 4; i < l; i++)
            answer_elems.eq(i).on('click',handleAnswerClick(i == random_index)).text(
                i == random_index ? data.correctAnswer : (i > random_index ? data.incorrectAnswers[i - 1] : data.incorrectAnswers[i])
            )[0].is_correct = i == random_index;
    }
}

handleInitialSetup();