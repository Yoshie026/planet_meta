var landingPageBtn = document.getElementById("lp");
var navSection = document.getElementsByClassName("nav");
var topTitle = document.getElementById("title");
var closeBtn = document.getElementById("close");
var avatarBtn = document.getElementById("avatar");
var metaphorBtn = document.getElementById("metaphor");
var aboutBtn = document.getElementById("about");
var modeBtn = document.getElementById("modeBtn");
var returnBtn = document.getElementById("return");
var paragraphDiv = document.getElementById("paragraphDiv");
var planetTitle = document.getElementById("planetTitle");
var diagram = document.getElementById("diagram");
let pressedBtn, currentDom;
var body = document.body;
let canvas;
currentDom = body.childNodes;

var replaceTo = ["DATA", "VERSE", "MORPHOSIS"];

var sentence = landingPageBtn.querySelector('h2').textContent;

function replaceSentence() {
    var r = Math.floor(Math.random() * 4);
    replaceTo.push("PHOR");
    var newText = sentence.replace(sentence.split('/')[1], replaceTo[r]);
    // console.log(sentence.split('/')[1]);
    sentence = newText;
    //     targets: '.ml14 .letter',
    //     opacity: [0, 1],
    //     translateX: [40, 0],
    //     translateZ: 0,
    //     scaleX: [0.3, 1],
    //     easing: "easeOutExpo",
    //     duration: 800,
    //     offset: '-=600',
    //     delay: (el, i) => 150 + 25 * i
    // });
    landingPageBtn.querySelector('h2').innerText = newText;
}


landingPageBtn.addEventListener("mouseenter", function(event) {
    anime.timeline({
            loop: false
        })
        .add({
            targets: '.lp h2 div',
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 400,
            offset: '-=775',
            delay: (el, i) => 34 * (i + 1)
        });

    replaceSentence();
}, false);


closeBtn.addEventListener("click", () => {
        // console.log(currentDom);
        canvas = document.getElementById('canvas');
        canvas.remove();
        var newCanvas = document.createElement('div');
        newCanvas.setAttribute('id', 'canvas');
    },
    false);



avatarBtn.addEventListener("click", () => {
        // console.log(currentDom);
        canvas = document.getElementById('canvas');
        canvas.remove();
        var newCanvas = document.createElement('div');
        newCanvas.setAttribute('id', 'canvas');
        body.appendChild(newCanvas);
        var selectionLayer = document.createElement('div');
        selectionLayer.setAttribute('class', 'selectionLayer');
        var splitLayerLeft = document.createElement('div');
        splitLayerLeft.setAttribute('class', 'imageLayer left');
        splitLayerLeft.innerHTML = '<h2>CLOUD</h2>';

        var splitLayerLeft = document.createElement('img');
        splitLayerLeft.setAttribute('class', 'avatarImg');
        splitLayerLeft.setAttribute('id', 'leftImg');
        splitLayerLeft.setAttribute('src', './assets/img/cloud.png');

        var splitLayerRight = document.createElement('img');
        splitLayerRight.setAttribute('class', 'avatarImg');
        splitLayerRight.setAttribute('id', 'rightImg');
        splitLayerRight.setAttribute('src', './assets/img/cookie.png');

        var splitLayerCenter = document.createElement('img');
        splitLayerCenter.setAttribute('class', 'avatarImg');
        splitLayerCenter.setAttribute('id', 'centerImg');
        splitLayerCenter.setAttribute('src', './assets/img/ai.png');

        var splitBtnLeft = document.createElement('div');
        splitBtnLeft.setAttribute('class', 'overlay');
        splitBtnLeft.setAttribute('id', 'left');
        splitBtnLeft.innerHTML = '<h2>CLOUD</h2>';
        splitBtnLeft.addEventListener("click", () => {
            splitBtnLeft.classList.toggle('closed');
        });
        var splitBtnRight = document.createElement('div');
        splitBtnRight.innerHTML = '<h2>COOKIE</h2>';
        splitBtnRight.setAttribute('class', 'overlay');
        splitBtnRight.setAttribute('id', 'right');
        splitBtnRight.addEventListener("click", () => {
            splitBtnRight.classList.toggle('closed');
        });
        var splitBtnCenter = document.createElement('div');
        splitBtnCenter.setAttribute('class', 'overlay');
        splitBtnCenter.setAttribute('id', 'center');
        splitBtnCenter.innerHTML = '<h2>AI</h2>';
        splitBtnCenter.addEventListener("click", () => {
            splitBtnCenter.classList.toggle('closed');
        });


        selectionLayer.appendChild(splitBtnLeft);
        selectionLayer.appendChild(splitBtnCenter);
        selectionLayer.appendChild(splitBtnRight);
        selectionLayer.appendChild(splitLayerLeft);
        selectionLayer.appendChild(splitLayerRight);
        selectionLayer.appendChild(splitLayerCenter);
        newCanvas.appendChild(selectionLayer);

    },
    false);


metaphorBtn.addEventListener("click", () => {
        // console.log(currentDom);
        canvas = document.getElementById('canvas');
        canvas.remove();
        var newCanvas = document.createElement('div');
        newCanvas.setAttribute('id', 'canvas');
        // newCanvas.innerHTML = 'something static';
        var headlineMetaphor = document.createElement('h1');
        headlineMetaphor.setAttribute('class', 'title fade-in');
        headlineMetaphor.setAttribute('id', 'title');
        headlineMetaphor.textContent = "Meta/phor";
        newCanvas.appendChild(headlineMetaphor);
        diagram.style.display = 'block';


        var metaphorContent = document.createElement('div');
        metaphorContent.setAttribute('id', 'metaphorContent');
        metaphorContent.setAttribute('class', 'metaphorContent stop-scrolling fade-in');
        metaphorContent.appendChild(diagram);
        newCanvas.appendChild(metaphorContent);

        var metaphorParagraph = document.createElement('div');
        metaphorParagraph.setAttribute('id', 'metaphorParagraph');
        metaphorParagraph.setAttribute('class', 'metaphorParagraph');
        metaphorParagraph.innerHTML = "<p>At school, we’ve all learned about metaphors as a linguistic play of words or a way to add to the quality of an essay. But, we’re never taught about the influence language, particularly metaphors, have on the way we shape reality. They are more than an addition to “normal” language, they are the base of our language and therefore of how we communicate, think and view the world. Cognitive scientists Lakoff and Johnson decided to separate reality into concrete concepts; physical entities, properties, and activities and abstract concepts; what is not visible; emotions, purposes & ideas. The metaphors we use to comprehend abstract concepts take root in what we experience with our bodies in the physical world. Metaphors therefore operate at the intersection of concrete and abstract, using the former to explain the latter. <br>These metaphors are so intertwined with our vision of the world that we even forget we speak in metaphorical ways. Love, for example, is a very complex yet abstract human concept. Consequently, to talk about relationships, we’ll often use the idea of travel which our bodies can physically witness.</p>";
        metaphorContent.appendChild(metaphorParagraph);

        // newCanvas.appendChild(metaphorContent);
        body.appendChild(newCanvas);
        title.style.display = 'flex';


        var figure1 = document.createElement('div');
        figure1.setAttribute('class', 'figure1 metaphorFigures fade-in');
        figure1.setAttribute('id', 'figure1');
        var caption1 = document.createElement('figcaption');
        caption1.innerHTML = "example: que accedente<br>quod et nomenclarotes<br>adsueti haec et talia<br>venditar,";

        figure1.appendChild(caption1);
        metaphorContent.appendChild(figure1);
        // splitLayerLeft.setAttribute('src', './assets/img/cloud.png');

        var figure2 = document.createElement('div');
        figure2.setAttribute('class', 'figure2 metaphorFigures fade-in');
        figure2.setAttribute('id', 'figure2');
        var caption2 = document.createElement('figcaption')
        caption2.innerHTML = "example: que accedente<br>quod et nomenclarotes<br>adsueti haec et talia<br>venditar,";
        figure2.appendChild(caption2);
        metaphorContent.appendChild(figure2);

        // splitLayerRight.setAttribute('src', './assets/img/cookie.png');

        var figure3 = document.createElement('div');
        figure3.setAttribute('class', 'figure3 metaphorFigures fade-in');
        figure3.setAttribute('id', 'figure3');
        var caption3 = document.createElement('figcaption')
        caption3.innerHTML = "example: que accedente<br>quod et nomenclarotes<br>adsueti haec et talia<br>venditar,";
        figure3.appendChild(caption3);
        metaphorContent.appendChild(figure3);


        // let sectionTwo = document.querySelector('#section-2');
        var circle1 = document.querySelector('.diagram .circle1');
        var circle2 = document.querySelector('.diagram .circle2');
        window.addEventListener('scroll', function() {
            let scroll = window.scrollY;
            console.log(scroll);
            if (scroll > 200) {
                circle1.style.right = (scroll * 0.2) + "%";
                console.log(circle1.style.right);

                circle2.style.left = (scroll * 0.2) + "%";
                console.log(circle2.style.left);
            }
            if (scroll < 300) {
                metaphorContent.classList.remove("stop-scrolling");
                // metaphorContent.style.overflowY = "scroll";
            }

        });





        // metaphorContent.addEventListener('scroll', function() {
        //     let scroll = metaphorContent.scrollY;
        //     // console.log("ss");
        //     if (scroll)
        //         if (scroll > 0) {
        //             console.log(scroll);

        //             circle1.style.left += 0.05;
        //             circle2.style.left -= 0.05;
        //         } else {


        //         }
        // });



        // let scrolling = false;
        // var s = canvas.scrollTop(),
        //     d = document.height(),
        //     c = canvas.height();
        // var scrollPercent = (s / (d - c));
        // // const content = document.getElementById("content");
        // metaphorContent.addEventListener("scroll", (e) => {
        //     // scrolling = true;

        //     var scrollPercent = (s / (d - c));
        //     console.log(getScrollPercent);
        // });




        // var position = canvas.offsetTop;
        // var scrolled = document.scrollingElement.scrollTop;
        // metaphorContent.addEventListener("scroll", (e) => {
        //     var position = canvas.offsetTop;
        //     var scrolled = document.scrollingElement.scrollTop;
        //     //     if (scrolled > position + 100) {
        //     //         content.classList.add(
        //     //             'curtain-in');
        //     //     }
        //     // });
        //     // console.log(scrollPercent);


        //     canvas.scroll(function() {
        //         var s = canvas.scrollTop(),
        //             d = document.height(),
        //             c = canvas.height();

        //         var scrollPercent = (s / (d - c));
        //         console.log(scrollPercent);




        // circle1.css({
        //     'right': position
        // });

        // circle2.css({
        //     'left': position
        // });

        // if (s > 400) {
        //     $heart.css({
        //         'OPACITY': '1'
        //     })

        // }
        // if (s < 400) {
        //     $heart.css({
        //         'opacity': '1'
        //     })
        // }
        // });
        // });


        // splitLayerCenter.setAttribute('src', './assets/img/ai.png');
    },
    false);



aboutBtn.addEventListener("click", () => {
        // console.log(currentDom);
        canvas = document.getElementById('canvas');
        canvas.remove();
        var newCanvas = document.createElement('div');
        newCanvas.setAttribute('id', 'canvas');
        // newCanvas.innerHTML = 'something static';

        var headlineAbout = document.createElement('h1');
        headlineAbout.setAttribute('class', 'title fade-in');
        headlineAbout.setAttribute('id', 'title');
        headlineAbout.textContent = "About";
        newCanvas.appendChild(headlineAbout);

        var aboutParagraph = document.createElement('div');
        aboutParagraph.setAttribute('id', 'aboutParagraph');
        aboutParagraph.setAttribute('class', 'aboutParagraph fade-in');
        aboutParagraph.innerHTML = "<h3>Welcome to project Planet Meta/</h3><p>Our mission is to ensure the correct transmission of information between our human universe and the meta/ universe.The three known planets of this system are xxx, xxx and xxx. After years of observation by us, humans, these planets and inhabitants have become an integral part of the collective intergalactic knowledge. From the ethereal and floating clouds of planet XXX to planet AI’s obscure light which the whole system revolves around, scientists have built rich theories and interpretations. Up until recently, this knowledge seemed to make sense to the human species. The transmission tools used to observe and decipher the planets meta/ managed to turn the received information into understandable concepts for all. Humans felt a sense of control and understanding of this far away galaxy.Gradually, we started to notice signs of glitching in the transmission, altering the harmony between the information sent by meta/ and the information we received. Project Planet Meta/ delved into this glitch and realized that the tools we had been using to decrypt these planets had been distorting the information. Whilst we kept on viewing these planets the same, the glitch revealed that, behind this faulty simulation we had been receiving, lied a different truth. Using this glitch as an entrance into the real face of the meta galaxy, we finally saw xxx, xxx and xxx under a new light.</p><h3>When avatars go to sleep, where do they go?</h3><p>Project planet meta decided to call this newly found version, the night version as it seems like this perspective on the meta galaxy had been kept in the dark before the occurrence of the Glitch. Ultimately the night version shows us what the avatars of the digital world look like when they’re not busy pretending to be something they are not, when the mask of the simulacra falls down. Will the newly discovered night version of Planet meta end up enlightening us?</p>";
        newCanvas.appendChild(aboutParagraph);

        var credit = document.createElement('div');
        credit.setAttribute('id', 'credit');
        credit.setAttribute('class', 'credit fade-in');
        credit.innerHTML = "<p>A project by Luna Gooriah</p><br><h3>Creative Direction</h3><p>Luna Gooriah</p><br><h3>UX Design/Web Development</h3><p>Yoshitsugu Kosaka</p><br><h3>3D Design</h3><p>Sanem Ozman</p><p>Sarah Ejiyone</p><p>Paulina Bosz</p>";
        newCanvas.appendChild(credit);




        body.appendChild(newCanvas);
        title.style.display = 'flex';

    },
    false);