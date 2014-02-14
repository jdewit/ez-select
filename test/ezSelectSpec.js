describe('ez-select', function() {
  var el, _scope, setQuery, $q, $httpBackend;

  beforeEach(module('ez.select'));

  beforeEach(inject(function($rootScope, $compile, _$q_, _$httpBackend_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;

    _scope = $rootScope.$new();

    el = angular.element('<ez-select options="options" selected="selectedOptions" data-multiple="true"></ez-select>');

    el2 = angular.element('<ez-select options="options2" selected="selectedOption2" search="true"></ez-select>');
    el3 = angular.element('<ez-select options="options3" selected="selectedOption3" data-placeholder="Ajax Search" data-url="/api/test/search"></ez-select>');

    // should sort Two, One, Three
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
    _scope.selectedOption2 = '2';
    _scope.selectedOption3 = '';

    _scope.search = false;

    $compile(el)(_scope);
    $compile(el2)(_scope);
    $compile(el3)(_scope);
    _scope.$digest();

    setQuery = function(element, val) {
      element.find('.search-box input').val(val).trigger('input').trigger('blur');
      _scope.$apply();
    };
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('multi - should init ez-select', function() {
    assert.lengthOf(el.find('.dropdown-menu li'), 3, 'should render 3 options');
    assert.equal(el.find('.dropdown-menu li:eq(0) .text').text(), 'Two', 'should render selected option first');
    assert.equal(el.find('.dropdown-menu li:eq(1) .text').text(), 'One', 'should sort options by name');
    assert.equal(el.find('.dropdown-menu li:eq(2) .text').text(), 'Three', 'should sort options by name');
    assert.isTrue(el.find('.dropdown-menu li:eq(0)').hasClass('selected'), 'should have selected class');
    assert.equal(el.find('.tag-container .text:eq(0)').text(), 'Two', 'should render selected option as a tag');
  });

  it('single - should init ez-select', function() {
    assert.lengthOf(el2.find('.dropdown-menu li'), 3, 'should render 3 options');
    assert.equal(el2.find('.dropdown-menu li:eq(0) .text').text(), 'Two', 'should render selected option first');
    assert.equal(el2.find('.dropdown-menu li:eq(1) .text').text(), 'One', 'should sort options by name');
    assert.equal(el2.find('.dropdown-menu li:eq(2) .text').text(), 'Three', 'should sort options by name');
    assert.isTrue(el2.find('.dropdown-menu li:eq(0)').hasClass('selected'), 'should have selected class');
    assert.equal(el2.find('.ez-select-toggle .text').text(), 'Two', 'should render selected text');
  });

  it('single - should add & remove selection on click', function() {
    el2.find('.ez-select-toggle').click();
    el2.find('li:eq(0) a').click();

    assert.equal(el2.find('.ez-select-toggle .text').text(), 'Select an option', 'should set initial text to default when none selected');
  });

  it('multi - should add & remove items on click', function() {
    el.find('.ez-select-toggle').click();
    el.find('.dropdown-menu li:eq(0) a').click();
    assert.lengthOf(_scope.selectedOptions, 0, 'should have 0 options selected');

    el.find('.dropdown-menu li:eq(0) a').click(); // select One
    el.find('.dropdown-menu li:eq(1) a').click(); // select Three

    assert.lengthOf(_scope.selectedOptions, 2, 'should have 2 options selected');
    assert.includeMembers(_scope.selectedOptions, ['1', '3']);
    el.find('li:eq(1) a').click();
    assert.lengthOf(_scope.selectedOptions, 1, 'should have 1 options selected');
    el.find('li:eq(0) a').click();
    assert.lengthOf(_scope.selectedOptions, 0, 'should have 0 options selected');
  });

  it('should filter options with search query', function() {
    setQuery(el, 'One');
    assert.lengthOf(el.isolateScope()._options, 1, 'should have 1 option available');

    setQuery(el, 'T');
    assert.lengthOf(el.isolateScope()._options, 2, 'should have 2 options available');

    setQuery(el, '');
    assert.lengthOf(el.isolateScope()._options, 3, 'should have 3 options available');
  });

  it('should use ajax search to get options if url is set', function() {
    $httpBackend.expectGET('/api/test/search?q=tw').respond([{id: "2", text: "Two"}, {id: "12", text: "Twelve"}]);

    setQuery(el3, 'tw');
    $httpBackend.flush();

    assert.lengthOf(el3.isolateScope()._options, 2, 'should have 2 options available');

    setQuery(el3, '');
    assert.lengthOf(el3.isolateScope()._options, 0, 'should have 0 options available');
  });

  it('should be able to override defaults', function() {
    assert.equal(el3.find('.ez-select-toggle .text').text(), 'Ajax Search', 'Set placeholder');
    assert.equal(el3.find('.dropdown-menu li:last-child a').text(), 'Enter 2 or more characters...', 'Set placeholder');
  });
});
