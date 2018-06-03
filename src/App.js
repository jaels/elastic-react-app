import React, {Component} from 'react';
import './App.css';
import elastic from './elastic/elastic.js';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fromYear: 0,
            toYear: 0,
            checkedBoxes: []
        }
    }

    componentWillMount() {
        elastic.findMinYear().then(result => {
            this.setState({fromYear: result.aggregations.min_year.value})
            elastic.findMaxYear().then(result => {
                this.setState({toYear: result.aggregations.max_year.value})

            })
        })
    }

    handleSubmit() {
        elastic.searchMultiMatch("Waters", ["firstname", "lastname"]);
    }

    handleChangeInCheckbox(e) {
        let {checkedBoxes} = this.state;
        let whichBox = e.target.value;
        let checked = e.target.checked;
        if (checked) {
            checkedBoxes.push(whichBox);
        } else {
            checkedBoxes.splice(checkedBoxes.indexOf(whichBox), 1);
        }
        this.setState({checkedBoxes});
    }

    render() {
        let {fromYear, toYear} = this.state;
        return (
            <div className="App">
                <h1>Search For an Artice</h1>
                <div className="input-area">
                    <input className="input-field" placeholder="what do you want to search?"/>
                    <h3>Search in:</h3>
                    <label className="checkBox">
                        <input type="checkbox" name="firstname" value="firsname" onChange={this.handleChangeInCheckbox.bind(this)}/>
                        Author's first name
                    </label>
                    <label className="checkBox"><input type="checkbox" name="lastname" value="lastname" onChange={this.handleChangeInCheckbox.bind(this)}/>
                        Author's last name
                    </label>
                    <label className="checkBox"><input type="checkbox" name="title" value="title" onChange={this.handleChangeInCheckbox.bind(this)}/>
                        Title of the article
                    </label>
                    <label className="checkBox"><input type="checkbox" name="body" value="body" onChange={this.handleChangeInCheckbox.bind(this)}/>
                        Body of the article
                    </label>

                    <label className="checkBox"><input type="text" name="fromYear" placeholder={fromYear}/>
                        From year
                    </label>

                    <label className="checkBox"><input type="text" name="fromYear" placeholder={toYear}/>
                        To year
                    </label>

                    <button id="submit-button" onClick={this.handleSubmit.bind(this)}>
                        Submit
                    </button>
                </div>
            </div>
        );
    }
}

export default App;
