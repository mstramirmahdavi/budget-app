// budget controller 
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentages = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentages = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

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
  };

  return {
    addItem: function (type, des, val) {
      var newitem, ID;
      //create new ID

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item
      if (type === 'exp') {
        newitem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newitem = new Income(ID, des, val);
      }
      // push it into the data structure
      data.allItems[type].push(newitem);

      // return the new item 
      return newitem;
    },
    deleteItem: function (type, id) {
      var IDs, index;

      IDs = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = IDs.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function () {
      // calculate total incomes and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the budget
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentages(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPercentages = data.allItems.exp.map(function (cur) {
        return cur.getPercentages();
      });
      return allPercentages;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function () {
      console.log(data);
    }
  }
})();
// UI controller 
var UIController = (function () {
  var DOMstrings = {
    container: '.container',
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }
  var formatNumber = function (num, type) {
    var numSplit, int, dec, sign;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    return (type === 'exp' ? '-' : '+') + ' ' + int + ' . ' + dec + ' $';
  };
  /* 
   * function getInputFunc
   * return Object {
   * type 
   * description
   * value
   * } 
   */
  function getInputFunc() {
    return {
      type: document.querySelector(DOMstrings.inputType).value,
      description: document.querySelector(DOMstrings.inputDescription).value,
      value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
    }
  }

  var nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i)
    }
  };
  /* 
   * getInput => to access getInputFunc in UIController
   * getDOMString => to access DOMstrings variable
   */
  return {
    getInput: getInputFunc,
    addListItem: function (obj, type) {
      var html, newHtml, element;
      // create HTML string 
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      }

      // replace the HTML string with actual data

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // insert HTML into the DOMs
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItems: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current) {
        current.value = '';
      });
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');


      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function (percentage) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);



      nodeListForEach(fields, function (current, index) {
        if (percentage[index] > 0) {
          current.textContent = percentage[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function () {
      var now, year, month;
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent = year + ' ' + monthNames[month];
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ', ' +
        DOMstrings.inputDescription + ', ' +
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
    },

    getDOMString: function () {
      return DOMstrings;
    }
  }
})();

// global app controller 
var Controller = (function (bugetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOMs = UIController.getDOMString();
    // addEventListener for add btn and keypress (ENTER Button) 
    document.querySelector(DOMs.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOMs.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOMs.inputType).addEventListener('change', UICtrl.changedType);
  }

  var updateBudget = function () {
    // 1. Calc the budget
    bugetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = bugetCtrl.getBudget();
    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };


  var updatePercentages = function () {
    // 1. calc percentage
    bugetCtrl.calculatePercentages();
    // 2. read percentage frrom the budget controller
    var percentages = bugetCtrl.getPercentages();
    // 3. update the UI
    UICtrl.displayPercentages(percentages);

  };


  var ctrlAddItem = function () {
    var input, newItem;
    // 1. Get the field input data
    input = UICtrl.getInput();
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = bugetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. clear the fields
      UICtrl.clearFields();

      // 5. Calc and update budget
      updateBudget();

      // 6. calc and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (e) {
    var itemID, splitID, type, ID;

    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete item from the data structure
      bugetCtrl.deleteItem(type, ID);
      // 2. delete the item from the UI
      UICtrl.deleteListItems(itemID);
      // 3. update and show the new budget
      updateBudget();
      // 4. calc and update percentages
      updatePercentages();
    }
  }
  return {
    init: function () {
      console.log("app is started");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
      UICtrl.displayMonth();
    }
  };

})(budgetController, UIController);

Controller.init();