class BookCollection{
    collectionName;
    constructor(collectionName){
        this.collectionName = collectionName;
    }

    read(){
        const arrStr = localStorage.getItem(this.collectionName);
        return arrStr == null ? [] : JSON.parse(arrStr);
    }
    append(book) {
        const array = this.read();
        array.push(book);
        const transArr = JSON.stringify(array);
        localStorage.setItem(this.collectionName,transArr)
    }
    remove(index){
        const array = this.read();
        array.splice(index,1);
        const transArr = JSON.stringify(array);
        localStorage.setItem(this.collectionName,transArr);
    }
}



export const currentBorrowedBooks = new BookCollection('currentlyBorrowedCollection');

export const favouriteBooks = new BookCollection('favouriteCollection');

export const  previousBooks =new BookCollection('previouslyBorrowedBooks');