import { LightningElement, track } from "lwc";
import { refreshApex } from '@salesforce/apex';
const columns = [
    { label: 'Creditor', fieldName: 'creditorName'},
    { label: 'First Name', fieldName: 'firstName' },
    { label: 'Last Name', fieldName: 'lastName' },
    { label: 'Min Pay%', fieldName: 'minPaymentPercentage' },
    { label: 'Balance', fieldName: 'balance' },
];
const endPoint = "https://api.github.com/repos/sheetalAS/Test/contents/data.json";

export default class ExploreFetchAPI extends LightningElement {
  @track repos;
  @track reposData;
  @track checkRowCount;
  @track totalRowCount;
  @track selectedBalance;
  @track showModal =false;
  @track tempRow = {};
  @track selectedRows;
  columns = columns;
  sha = '';
  hasRendered = false;
  
  async connectedCallback() {
    this.getGitData();   
     }

  getGitData(){
    fetch(endPoint, {
      method: "GET"
    })
      .then((response) => response.json()) 
      .then((data) => {
        this.repos = JSON.parse(atob(data.content));// content is encoded hence decode is required.
        this.sha = data.sha;
        this.totalRowCount = this.repos.length;
     });
  }

  setGitData(){
    console.log('latest file',this.repos);
    const requestOptions = {
      method: "PUT",
     // mode: 'no-cors',
      headers: { 
        "Content-Type": "application/json" ,
        'Authorization' : 'Bearer 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' // access token generated at gitgub
       },
      body: JSON.stringify({ 
        message: 'update the file',
        content: btoa(JSON.stringify(this.repos)),
        sha:this.sha
       })
  };
   fetch(endPoint, requestOptions)
    .then((response) => response.json()) 
    .then((repos) => {
        console.log(JSON.stringify(repos));
       
     })
     .catch(err => console.log(err));; 
    
  }

  handleInputChange(event) {
    this.tempRow[event.target.name] = event.target.value;
  }

  handleAdd(event){
    this.tempRow = {};
    this.tempRow.id = this.repos.length + 1;
    this.showModal = true;
  }

  handleSave(event){
    const allValid = [...this.template.querySelectorAll(`lightning-input`)]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        if (!allValid) {
            return;
        }

      let newData = JSON.parse(JSON.stringify(this.repos));
      newData.push(this.tempRow);
      this.repos = newData;
      this.totalRowCount = this.repos.length;
     this.setGitData() ;
     this.tempRow = {};
    this.showModal = false;
    refreshApex(this.repos);
  }

  handleCancel(event){
    this.tempRow = {};
    this.showModal = false;
    
  }

  handleRemove(event){
    
    console.log(this.selectedRows);
    let newData = JSON.parse(JSON.stringify(this.repos));
    for (let i = 0; i < this.selectedRows.length; i++){
      newData = newData.filter(row => row.id !== this.selectedRows[i].id);
  }
  console.log(newData);
  this.repos = newData; 
  this.totalRowCount = this.repos.length;  
  this.setGitData() ;
  this.tempRow = {};
  this.showModal = false;
  refreshApex(this.repos);
  }
  
  handleSelect(event) {
    this.selectedRows = event.detail.selectedRows;    
    this.checkRowCount =  this.selectedRows.length;
    this.selectedBalance = 0;
    for (let i = 0; i < this.selectedRows.length; i++){
      this.selectedBalance += parseInt(this.selectedRows[i].balance);
  }
    console.log('Checked',this.checkRowCount);
}

  renderedCallback() {
    if(this.hasRendered == false) {
      this.getGitData();
      this.hasRendered = true;
    }
}

}