/**
 * Created by ramezashraf on 13/08/16.
 */

(function ($) {

    function failFunction(data, $elem) {
        if (data.status === 403) {
            $elem.hide()
        } else {
            notify_error();
            // unblockDiv($elem);
        }
    }

    function loadComponents(data, $elem) {
        let chartElem = $elem.find('[data-report-chart]');
        if (chartElem.length !== 0 && data.chart_settings.length !== 0) {
            $.ra.report_loader.displayChart(data, chartElem);
        }
        $.ra.report_loader.createChartsUIfromResponse(data, $elem)
        let tableElem = $elem.find('[data-report-table]');
        if (tableElem.length !== 0) {
            $.ra.datatable.buildAdnInitializeDatatable(data, tableElem);
        }

    }

    function displayChart(data, $elem, chart_id) {
        executeFunctionByName($.ra.report_loader.chart_handler_func, window, data, $elem, chart_id)
    }


    function refreshReportWidget($elem, extra_params) {

        let successFunctionName = $elem.attr('data-success-callback');
        successFunctionName = successFunctionName || "$.ra.report_loader.loadComponents";
        let failFunctionName = $elem.attr('data-fail-callback');
        failFunctionName = failFunctionName || "$.ra.report_loader.failFunction";

        let url = $elem.attr('data-report-url');
        extra_params = extra_params || ''
        let extraParams = extra_params + ($elem.attr('data-extra-params') || '');

        if (url === '#') return; // there is no actual url, probably not enough permissions
        else url = url + '?';

        if (extraParams !== '') {
            url = url + extraParams;
        }

        $.get(url, function (data) {
            $.ra.cache[data['report_slug']] = jQuery.extend(true, {}, data);
            executeFunctionByName(successFunctionName, window, data, $elem);
        }).fail(function (data) {
            executeFunctionByName(failFunctionName, window, data, $elem);
        });

    }


    function initialize() {
        $('[data-report-widget]').not('[data-no-auto-load]').each(function (i, elem) {
            refreshReportWidget($(elem));
        });
    }

    function createChartsUIfromResponse(data, $elem, a_class) {
        a_class = typeof a_class == 'undefined' ? 'groupChartController' : a_class;
        let $container = $('<div></div>');

        let chartList = data['chart_settings'];
        let report_slug = data['report_slug'];
        $elem.find('.groupChartControllers').remove();
        if (chartList.length !== 0) {
            $container.append('<div class="groupChartControllers">' +
                '<ul class="nav nav-charts"></ul></div>');
        }
        var ul = $container.find('ul');
        for (var i = 0; i < chartList.length; i++) {
            var icon;
            var chart = chartList[i];
            if (chart.disabled) continue;

            let chart_type = chart.type;
            if (chart_type === 'pie') icon = '<i class="fas fa-chart-pie"></i>';
            else if (chart_type === 'line') icon = '<i class="fas fa-chart-line"></i>';
            else if (chart_type === 'area') icon = '<i class="fas fa-chart-area"></i>';
            else icon = '<i class="fas fa-chart-bar"></i>';

            ul.append('<li class="nav-link"><a href class="' + a_class + '" data-chart-id="' + chart.id + '" ' +
                'data-report-slug="' + report_slug + '">' + icon + ' ' + capfirst(chart.title) + '</a></li>')
        }
        $elem.prepend($container)
        return $container
    }

    $('body').on('click', '.groupChartController', function (e) {
        e.preventDefault();
        let $this = $(this);
        let data = $.ra.cache[$this.attr('data-report-slug')]
        let chart_id = $this.attr('data-chart-id')
        $.ra.report_loader.displayChart(data, $this.parents('[data-report-widget]').find('[data-report-chart]'), chart_id)

    });

    $.ra.report_loader = {
        cache: $.ra.cache,
        initialize: initialize,
        refreshReportWidget: refreshReportWidget,
        failFunction: failFunction,
        displayChart: displayChart,
        createChartsUIfromResponse: createChartsUIfromResponse,
        // displayReport: displayReport,
        loadComponents: loadComponents,
        'chart_handler_func': '$.ra.highcharts.displayChart'

    }
})(jQuery);