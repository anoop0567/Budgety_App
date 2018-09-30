// BUDGET CONTROLLER
var budgetController = (function () {

    // Some Code

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentages = -1;
    }

    Expense.prototype.calcPercentage = function (totalincome) {

        if (totalincome > 0) {
            this.percentages = Math.round((this.value / totalincome) * 100);
        } else {
            this.percentages = -1;
        }

    }

    Expense.prototype.getPercentages = function () {
        return this.percentages;
    }


    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // ID =last ID + 1;

            // Create New ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            // Create new Item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into data structure
            data.allItems[type].push(newItem);

            // return new item
            return newItem;
        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (cur) {

                cur.calcPercentage(data.totals.inc);

            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentages();
            })

            return allPerc;
        },

        getBudget: function () {
            return {
                totalExp: data.totals.exp,
                totalInc: data.totals.inc,
                budget: data.budget,
                percentage: data.percentage
            }
        },

        data: function () {
            return data;
        },

        deleteItem: function (type, ID) {
            var IDs, index;

            IDs = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = IDs.indexOf(ID);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        }
    }

})();



// UI CONTROLLER
var UIController = (function () {

    //Some Code

    var DOMString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        expencesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var formatNumber = function (type, num) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, (int.length - 3)) + ',' + int.substr((int.length - 3), int.length);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    }

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value, // will be either income or expence
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            }
        },

        addListItem: function (obj, type) {

            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMString.incomeList;
                html = `<div class="item clearfix" id="inc-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            } else if (type === 'exp') {
                element = DOMString.expenseList;
                html = `<div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(type, obj.value));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorId) {

            var el = document.getElementById(selectorId);;
            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            var fields, fieldArr;

            fields = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputValue);

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldArr[0].focus();

        },

        displayBudget: function (obj) {


            obj.budget < 0 ? type = 'exp' : type = 'inc';

            document.querySelector(DOMString.budgetLabel).textContent = formatNumber(type, obj.budget);
            document.querySelector(DOMString.incomeLabel).textContent = formatNumber('inc', obj.totalInc);
            document.querySelector(DOMString.expenseLabel).textContent = formatNumber('exp', obj.totalExp);

            if (obj.totalInc > 0) {
                document.querySelector(DOMString.percentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMString.percentage).textContent = '--';
            }
        },

        getDOMstrings: function () {
            return DOMString;
        },

        displayPercentages: function (percentage) {
            var fields = document.querySelectorAll(DOMString.expencesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }

            })
        },

        displayMonth: function () {
            var now, year, month, months;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            year = now.getFullYear();

            month = now.getMonth();

            document.querySelector(DOMString.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {

            var fields = document.querySelectorAll(
                DOMString.inputType + ',' +
                DOMString.inputDescription + ',' +
                DOMString.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMString.inputBtn).classList.toggle('red');

        }
    }

})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtr, UICtr) {

    var setupEventListner = function () {

        var DOM = UICtr.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtr.changedType)
    };

    var updateBudget = function () {

        // 1. Calculate the budget
        budgetCtr.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtr.getBudget();

        // 3. Display the budget in UI
        UICtr.displayBudget(budget);
    }

    var updatePercentages = function () {

        // 1. Calculate the percentages
        budgetCtr.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtr.getPercentages();

        // 3. Update the UI with the new percentages
        UICtr.displayPercentages(percentages);

    }

    var ctrlAddItem = function () {

        var inputData = UICtr.getInput();
        // 1. Get filled Input Data

        if (inputData.description != "" && !isNaN(inputData.value) && inputData.value != 0) {

            var addItem = budgetCtr.addItem(inputData.type, inputData.description, inputData.value);
            // 2. Add the item to the Budget controller

            UICtr.addListItem(addItem, inputData.type);
            // 3. Add the item to the UI

            UICtr.clearFields();
            // 4. Clear Input fields

            updateBudget();
            // 5. Update Budget

            updatePercentages();
            // 6. calculate and update percentages
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from data structure
            budgetCtr.deleteItem(type, ID);

            // 2. Delete item from UI
            UICtr.deleteListItem(itemID);

            // 3. Update and show new budget
            updateBudget();

            // 4. calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init: function () {
            setupEventListner();
            UICtr.displayMonth();
            UICtr.displayBudget({
                totalExp: 0,
                totalInc: 0,
                budget: 0,
                percentage: -1
            });
            UICtr.clearFields();
        }
    }

})(budgetController, UIController);

controller.init();
