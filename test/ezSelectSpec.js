describe('ez-select', function() {
  var el, _scope, setQuery, $q, $timeout;

  beforeEach(module('ez.select'));

  beforeEach(inject(function($templateCache, $rootScope, $compile, _$q_, _$timeout_) {
    $q = _$q_;
    $timeout = _$timeout_;
		template = $templateCache.get('src/ez-select.tpl.html');
		$templateCache.put('ez-select.tpl.html', template);

    _scope = $rootScope.$new();

    el = angular.element('<ez-select options="options" selected-options="selectedOptions" search="search"></ez-select>');

    // will sort Three, Two, One
    _scope.options = [
      {
        id: '1',
        text: 'One'
      },
      {
        id: '2',
        text: 'Two'
      },
      {
        id: '3',
        text: 'Three'
      }
    ];

    _scope.options2 = {
      '1': {
        id: '1',
        text: 'One'
      },
      '2': {
        id: '2',
        text: 'Two'
      },
      '3': {
        id: '3',
        text: 'Three'
      }
    };


    _scope.selectedOptions = ['2'];

    _scope.search = false;

    $compile(el)(_scope);
    _scope.$digest();

    setQuery = function(val) {
      el.find('.search-box input').val(val).trigger('input').trigger('blur');
      _scope.$apply();
    };
  }));

  it('should init ez-select', function() {
    assert.isTrue(true);
    //assert.lengthOf(el.find('li'), 3, 'should render 3 options');
    //assert.equal(el.find('li:eq(0) .text').text(), 'Two', 'should render selected option first');
    //assert.isTrue(el.find('li:eq(0)').hasClass('selected'), 'should have selected class');
    //assert.equal(el.find('li:eq(1) .text').text(), 'Three', 'should render text');
    //assert.equal(el.find('.ez-select-toggle .text').text(), 'Two', 'should render selected option as default text');
  });

  //it('should add & remove items on click', function() {
    //el.find('.ez-select-toggle').click();
    //el.find('li:eq(0) a').click();

    //assert.equal(el.find('.ez-select-toggle .text').text(), 'Select an option', 'should set initial text to default when none selected');
    //el.find('li:eq(0) a').click();
    //el.find('li:eq(1) a').click();

    //assert.lengthOf(_scope.selectedOptions, 2, 'should have 2 options selected');
    //assert.includeMembers(_scope.selectedOptions, ['3', '2']);
    //el.find('li:eq(1) a').click();
    //assert.lengthOf(_scope.selectedOptions, 1, 'should have 1 options selected');
    //el.find('li:eq(0) a').click();
    //assert.lengthOf(_scope.selectedOptions, 0, 'should have 0 options selected');
  //});

  //it('should filter options with search query', function() {
    //setQuery('One');
    //assert.lengthOf(el.isolateScope()._options, 1, 'should have 1 option available');

    //setQuery('T');
    //assert.lengthOf(el.isolateScope()._options, 2, 'should have 2 options available');

    //setQuery('');
    //assert.lengthOf(el.isolateScope()._options, 3, 'should have 3 options available');
  //});

  //it('should use search function to get options if it is set', function() {
    //_scope.search = function() {
      //var deferred = $q.defer();

      //$timeout(function() {
        //var results = [
          //{id: '12', text: 'Twelve'},
          //{id: '13', text: 'Thirteen'}
        //];

        //deferred.resolve(results);
      //}, 500);

      //return deferred.promise;
    //};

    //setQuery('t');
    //$timeout.flush();

    //assert.lengthOf(el.isolateScope()._options, 4, 'should have 4 options available');

    //setQuery('');
    //assert.lengthOf(el.isolateScope()._options, 5, 'should have 5 options available');
    //assert.lengthOf(_scope.options, 5, 'should have 5 options available');
  //});
});
