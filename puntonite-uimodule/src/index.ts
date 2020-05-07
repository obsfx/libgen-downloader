import { Interfaces } from './interfaces.namespace';
import Main from './app/Main'

let strarrr: (string | undefined)[] = [
    "Understanding AJAX: Using JavaScript to Create Rich Internet Applications",
    "JavaScript & DHTML Cookbook",
    "JavaScript Bible [3 ed.]",
    "JavaScript Bible [4th ed] 9780764533426, 0764533428",
    "JavaScript bible [Gold ed] 0764547186",
    "Beginning JavaScript with DOM Scripting and Ajax: From Novice to Professional",
    "Inside Javascript",
    "JavaScript and Ajax for the Web: Visual QuickStart Guide",
    "Learning JavaScript",
    "JavaScript by Example",
    "Adobe Bridge Official JavaScript Reference",
    "JavaScript. Наглядный курс создания динамических Web-страниц",
    "JavaScript. Энциклопедия пользователя",
    "AJAX: Creating Web Pages with Asynchronous JavaScript and XML",
    "Uncanny Valley: A Memoir by Anna Wiener",
    "Competing in the age of AI: Strategy and leadership when algorithms",
    "Surveillance Valley: The Secret Military",
    "Hit Refresh by Satya Nadella",
    "Brotopia: Breaking Up the Boys' Club of Silicon Valley",
    "Harnessing our Digital Future by Andrew McAfee",
    "Innovation and Its Enemies: Why People Resist"
]

let listingarr: Interfaces.ListingObject[] = [];

for (let i = 0; i < strarrr.length; i++) {
    listingarr.push({
        text: strarrr[i] || ' ',
        submenu: null,
        value: strarrr[i] || ' '
    });
}


Main.init()

const p = async () => {
    let list: Interfaces.ListObject = {
        type: 'list',
        listings: listingarr
    }

    console.log(await Main.promptList(list));
    process.exit(0);

    // console.log(await Main.promptInput('Ara Ulan!: '));
    // process.exit(0);
}

p();