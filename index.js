// Create needed constants
const list = document.querySelector('ul');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const form = document.querySelector('form');
const submitBtn = document.querySelector('form button');


let db; 

window.onload = function(){

    let request = window.indexedDB.open('notes_db',1);

    request.onerror = function(){
        console.log('Database failed to open');
    };

    request.onsuccess = function(){
        console.log('database opened successfuly');
        db = request.result;
        displayData();
    };

    request.onupgradeneeded = function(e){
        let db = e.target.result;
        let objectStore = db.createObjectStore('notes_os', {keyPath: 'id', autoIncrement:true});
        objectStore.createIndex('title','title',{unique:false});
        objectStore.createIndex('body','body',{unique:false});
        console.log('database setup complete');
    };

    form.onsubmit = addData;
    function addData(e){

        e.preventDefault();
        let newItem = {title:titleInput.ariaValueMax, body: bodyInput.value};
        let transaction = db.transaction(['notes_os'], 'readwrite');
        let objectStore = transaction.objectStore('notes_os');
        let request = objectStore.add(newItem);
        request.onsuccess = function(){
            titleInput.value='';
            bodyInput.value = '';
        };

        transaction.oncomplete = function(){
            console.log('transcation complete: database mod finished.');
            displayData();
        };

        transaction.onerror = function(){
            console.log('transaction not opened due to erro');
        };
    }

    function displayData(){
        while(list.firstChild){
            list.removeChild(list.firstChild);
        }

        let objectStore = db.transaction('notes_os').objectStore('notes_os');
        objectStore.openCursor().onsuccess = function(e){
            let cursor = e.target.result;

            if(cursor){
                const listItem = document.createElement('li');
                const h3 = document.createElement('hs');
                const para = document.createElement('p');

                h3.textContent = cusror.value.title;
                para.textContent = cursor.value.body;

                listItem.setAttribute('data-note-id',cursor.value.id);

                const deleteBtn = document.createElement('button');
                listItem.appendChild(deleteBtn);
                deleteBtn.textContent = 'Delet';
                deleteBtn.onclick = deleteItem;

                cursor.continue();
            } else{
                if(!list.firstChild){
                    const listItem = document.createElement('li');
                    listItem.textContent = 'No notes stored';
                    list.appendChild(listItem);
                }
                console.log('notes all displayed');
            }
        };
    }

    function deleteItem(e){
        let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));
        let transaction = db.transaction(['notes_os'],'readwrite');
        let objectStore = transction.objectStore('notes_os');

        let request = objectStore.delete(noteId);

        transaction.oncomplete = function(){
            e.target.parentNode.parentNode.removeChild(e.target.parentNode);
            console.log('Note ' + noteId + ' deleted.');

            if(!list.firstChild){
                let listItem = document.createElement('li');
                listItem.textContent = 'No notes stored.';
                list.appendChild(listItem);
            }
        };
    }

};