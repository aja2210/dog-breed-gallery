const breedSelect = document.getElementById('breedSelect');
const breedSearch = document.getElementById('breedSearch');
const searchButton = document.getElementById('searchButton');
const deleteAllButton = document.getElementById('deleteAllButton');
const gallery = document.getElementById('gallery');
const quizContainer = document.getElementById('quizContainer');
const startFlashcardsButton = document.getElementById('startFlashcardsButton');
const flashcardContainer = document.getElementById('flashcardContainer');
const flashcard = document.getElementById('flashcard');
const nextFlashcardButton = document.getElementById('nextFlashcardButton');
const closeFlashcardsButton = document.getElementById('closeFlashcardsButton');
let breedOptions = [];
let suggestedName = '';

// when pressed goes to the next question in practice questions
const nextButton = document.createElement('button');

// Fetch the API and read in all the elements in it
fetch('https://dog.ceo/api/breeds/list/all')
.then(response => response.json())
.then(data => {
   const breeds = data.message;
   for (const breed in breeds) {
        //check if breed has type or not and adjust accordingly
       if (breeds[breed].length > 0) {
           breeds[breed].forEach(subtype => {
               const displayName = `${capitalize(subtype)} ${capitalize(breed)}`;
               breedOptions.push({ displayName, apiPath: `${breed}/${subtype}` });
           });
       } else {
           const displayName = capitalize(breed);
           breedOptions.push({ displayName, apiPath: breed });
       }
   }
   // make sure to sort everything alphabetically by first word rather than last word
   breedOptions.sort((a, b) => a.displayName.localeCompare(b.displayName));
   // add all these to the dropdown menu
   populateDropdown(breedOptions);
});

// Suggests names based on your search
breedSearch.addEventListener('input', () => {
    // makes sure search does not distinguish upper case and lower case
   const searchValue = breedSearch.value.toLowerCase();
   const filteredOptions = breedOptions.filter(option =>
       option.displayName.toLowerCase().includes(searchValue)
   );
   // checks if name exists or not, and if not shows an empty string in the dropdown bar
   if (filteredOptions.length > 0) {
       suggestedName = filteredOptions[0].displayName;
   } else {
       suggestedName = '';
   }
   populateDropdown(filteredOptions);
});

// enter key does the same as a search press
breedSearch.addEventListener('keypress', (event) => {
   if (event.key === 'Enter') {
       event.preventDefault(); // Prevents the search if inside a form
       performSearch();
   }
});

// Event listener when something in the dropdown menu is selected
breedSelect.addEventListener('change', () => {
   const option = breedSelect.options[breedSelect.selectedIndex];
   if (option) {
       breedSearch.value = option.textContent; // Text field gets update when something in the dropdown menu is selected
       suggestedName = option.textContent;
       fetchBreedImages(option.value); // Performs the search with this option
   }
});

// Even listener for deleting everything
deleteAllButton.addEventListener('click', () => {
   gallery.innerHTML = ''; // all images in the gallery disappear
});

// Populates the dropdown with options that are valid
function populateDropdown(options) {
   breedSelect.innerHTML = ''; // Deletes all previous options
   // creates the apiPath and name for each option in the breed
   options.forEach(breed => {
       const option = document.createElement('option');
       option.value = breed.apiPath;
       option.textContent = breed.displayName;
       breedSelect.appendChild(option);
   });
}

// Extra function to capitalize all words
function capitalize(word) {
   return word.charAt(0).toUpperCase() + word.slice(1);
}

// Search button performs search when clicked
searchButton.addEventListener('click', performSearch);

// Search performance function
function performSearch() {
   if (suggestedName) {
       breedSearch.value = suggestedName; // Set input to the first name on the dropdown menu

       const searchValue = breedSearch.value.toLowerCase();
       const matchedOption = breedOptions.find(option =>
           option.displayName.toLowerCase() === searchValue
       );
       if (matchedOption) {
           fetchBreedImages(matchedOption.apiPath);
       } else {
           console.log("Error: no matching breed found.");
       }
   }
}

// Fetch the images based on the search or selected search
function fetchBreedImages(breedPath) {
   fetch(`https://dog.ceo/api/breed/${breedPath}/images/random/1`) // Fetch a single random image at a time
   .then(response => response.json())
   .then(data => {
       if (data.status === 'success') {
           data.message.forEach(imageUrl => addImageToGallery(imageUrl));
       } else {
           console.error(`Error: no images found for ${breedPath}`);
       }
   });
}

// Adds an image to the gallery with an x button
function addImageToGallery(imageUrl) {
   const imgElement = document.createElement('img');
   imgElement.src = imageUrl;

   const deleteButton = document.createElement('button');
   deleteButton.textContent = 'X';
   deleteButton.className = 'delete-button';
    // if the delete button is pressed, removes the image the delete button corresponds to
   deleteButton.addEventListener('click', () => {
       gallery.removeChild(div);
   });

   // creates the image with the delete button and appends it to the gallery
   const div = document.createElement('div');
   div.className = 'gallery-item';
   div.appendChild(imgElement);
   div.appendChild(deleteButton);
   gallery.appendChild(div);
}


// Function to start the quiz in a new window
function startQuiz() {
  quizContainer.style.display = 'flex';
  let currentQuestionIndex = 0;
  let score = 0;
  

  nextButton.textContent = 'Next Question';
  nextButton.style.display = 'block'; // Initially hidden until question in answered
  nextButton.addEventListener('click', () => {
      document.getElementById('scoreDisplay').innerHTML = ''; // Delete the message of correct/incorrect
      generateQuestion();
  });
  quizContainer.appendChild(nextButton);

  function generateQuestion() {

      // gets a random image for the question and the corresponding correct answer
      const randomBreedIndex = Math.floor(Math.random() * breedOptions.length);
      const correctAnswerData = breedOptions[randomBreedIndex];
      const correctAnswerDisplayName = correctAnswerData.displayName;
      
      fetch(`https://dog.ceo/api/breed/${correctAnswerData.apiPath}/images/random`)
          .then(response => response.json())
          .then(data => {
              if (data.status === 'success') {
                  currentImageSrc = data.message;
                  displayQuestion(currentImageSrc, correctAnswerDisplayName);
              }
          });
  }

  // shows the question in the quiz
  function displayQuestion(imageSrc, correctAnswerDisplayName) {
      const questionContainer = document.getElementById('questionContainer');
      questionContainer.innerHTML = `
          <img src="${imageSrc}" alt="Dog Image" class="quiz-image">
          <p>What breed is this dog?</p>
          ${generateOptions(correctAnswerDisplayName)}`;
      currentQuestionIndex++;
  }

  // creates the random options with only one being correct
  function generateOptions(correctAnswerDisplayName) {
      let optionsHtml = '';
      // randomly orders the three wrong answers and one correct answer
      let shuffledBreeds = [...breedOptions].filter(breed => breed.displayName !== correctAnswerDisplayName)
          .sort(() => Math.random() - Math.random()).slice(0, 3);
      shuffledBreeds.push({ displayName: correctAnswerDisplayName });
      shuffledBreeds.sort(() => Math.random() - Math.random());
      
      // creates the buttons for the multiple choices
      shuffledBreeds.forEach(breed => {
          optionsHtml += `<button class="option-button" onclick="checkAnswer('${breed.displayName}', '${correctAnswerDisplayName}')">${breed.displayName}</button>`;
      });
      
      return optionsHtml;
  }

  // determines if answer is correct or incorrect and gives message depending on
  window.checkAnswer = function(selectedAnswer, correctAnswer) {
      let feedbackMessage;
      if (selectedAnswer === correctAnswer) {
          score++;
          feedbackMessage = `Correct!`;
      } else {
          feedbackMessage = `Incorrect! The correct answer was ${correctAnswer}.`;
      }
      
      document.getElementById('scoreDisplay').innerHTML = feedbackMessage;
      
  };

  generateQuestion();
}

// Add event listener to start the quiz button in main window
document.getElementById('startQuizButton').addEventListener('click', startQuiz);

// Add event listener to close quiz button in main window
document.getElementById('closeQuizButton').addEventListener('click', () => {    
  document.getElementById('quizContainer').style.display='none';
});


let currentIndex = 0;

// Function to create flashcards
function initializeFlashcards() {
    // Randomize order of breeds
    const shuffledBreeds = [...breedOptions].sort(() => Math.random() - 0.5);

    loadFlashcard(shuffledBreeds[currentIndex]);

    // Remove existing event listeners to stop duplication and errors
    nextFlashcardButton.removeEventListener('click', handleNextClick);
    flashcard.removeEventListener('click', handleFlip);

    // add listeners for next and close buttons
    nextFlashcardButton.addEventListener('click', () => handleNextClick(shuffledBreeds));
    flashcard.addEventListener('click', handleFlip);

    closeFlashcardsButton.addEventListener('click', () => {
        flashcardContainer.style.display = 'none';
        currentIndex = 0; // Reset index when closing
        flashcard.classList.remove('flipped');
    });
}

// Function to flip card to other side
function handleFlip() {
    flashcard.classList.toggle('flipped');
}

// Function to handle clicking next button in flashcard
function handleNextClick(shuffledBreeds) {
    currentIndex = (currentIndex + 1) % shuffledBreeds.length;
    loadFlashcard(shuffledBreeds[currentIndex]);
    flashcard.classList.remove('flipped');
}

// loads a flashcard properly
function loadFlashcard(breed) {
    fetch(`https://dog.ceo/api/breed/${breed.apiPath}/images/random`)
        .then(response => response.json())
        .then(data => {
            const imageUrl = data.message;

            document.querySelector('.front').innerHTML = `<img src="${imageUrl}" alt="${breed.displayName}" style="max-width: 100%; max-height: 100%;">`;
            document.querySelector('.back').textContent = breed.displayName;
        });
}

// opens the flashcards
startFlashcardsButton.addEventListener('click', () => {
   initializeFlashcards();
   flashcardContainer.style.display = 'flex';
});