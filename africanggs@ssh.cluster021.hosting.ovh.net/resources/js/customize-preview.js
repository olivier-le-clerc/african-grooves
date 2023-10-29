(function ($){

    // vars

    var stylesheetID = 'ag-style-css',
        stylesheet,
        styles,

        backgroundColor,
        primaryColor,
        secondaryColor,
        titleColor,
        textColor;
        backgroundImage='',

    // customize colors

    wp.customize('background-color', function(value){
        value.bind(function (newValue){
            backgroundColor = newValue;
            $('html').css('--background-color',newValue);
            //$('body').css('background-color',newValue);
        })
    })

    wp.customize('primary-color', function(value){
        value.bind(function (newValue){
            primaryColor = newValue;
            $('body').css('--primary-color',newValue);
        })
    })

    wp.customize('secondary-color', function(value){
        value.bind(function (newValue){
            secondaryColor = newValue;
            $('body').css('--secondary-color',newValue);
        })
    })

    wp.customize('link-color', function(value){
        value.bind(function (newValue){
            titleColor = newValue;
            $('body').css('--link-color',newValue);
        })
    })

    wp.customize('text-color', function(value){
        value.bind(function (newValue){
            textColor = newValue;
            $('body').css('--text-color',newValue);
        })
    })

    wp.customize('background-image', function(value){
        value.bind(function (newValue){
            backgroundImage = newValue;
            $('body').css('--background-image','url("' + newValue + '")');
        })
    });

})(jQuery);

