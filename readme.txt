contact us page
component that rolls new features

Sentences need an option for beginner, intermediate, etc. sentences.
images
Common mistakes could be it's own page
Translate button functionality in Vocabulary page
rolling features update 
Pixabay - send sqare pixel size to the component to control size
respond to Sonu
Work on Twilio

Make a page that has gets a word of the day or phrase of the day. Pull from a database of 365 words
work on translate button in Add a Word in vocabulary page

UPDATES
  - DONE remove email verification logic until Sonu is done with the SendGrid verification emails
  - create a 'Forgot Password?'
  - DONE on update in Profile page, put 'Update Successful' (put a popup)
  - get Country Code working (allow typing of country, maybe have a table in Supabase)
  - Format the input of the phone number
  - implement reCaptcha
  - Sonu - Twilio and SendGrid (for email verification)
  - DONE implement a lastlogintime when a user logs in
  - In the vocabulary page...
    - DONE when 'Save Word' is clicked, get the lists and words again
    - DONE when a list is clicked, make sure dropdown, word, translation, and 'Save Word' is hidden.
    - language field in vocabulary table might allow nulls in the user interface
  - DONE add an last login and a login count field to the profile table. Put code in login page that updates this field


very smart chat - beginner, intermediate. (in roles)

choose what things a user wants to study. 

choose a subject theme, options to study. to create a conversation. 

add a chat box under the 'Get Examples' in the 'My Vocabulary' page. Then instead of Get Examples, execute the button action with the chat window. Also populate a dropdown box that  executes the chat immediately and then has other dropdown suggestions for studying.
Such as provide suggestions for studying vocabulary with chat bot 

give top 20 mistakes
verbs that have a lot of meanings. 

make a backup of everything

Component ideas
  - a component for loading languages
  - a component for adding vocabulary words 
  - a component for adding images (get Pixabay working on the live URL idioma-ai.com)
  - a component to look up a translation for a word (input word, language. Return translated word.)
  - a component for a chatbot or additional chat after different web page functionality
  - a component for saving/printing content

With the left hand tsx file...
  - provide a link for each item that will take them to the item, but first make them sign up.

Pixabay fix
get Deepl translate functionality working. 

In Saas2.tsx, fix the answer part of the quiz

change fetchExamplesSentences to do the following: 1. before the open ai api is called, put all the word_translated items in a string that puts first word, then a comma and a space, then the second word then a comma and a space, until the last word then only put a space. 2. use this string 
