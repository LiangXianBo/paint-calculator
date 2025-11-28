// 涂料重量计算器主要逻辑
class PaintCalculator {
    constructor() {
        this.chart = null;
        this.history = this.loadHistory();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderHistory();
        this.initChart();
        this.loadExampleData(); // 自动加载示例数据
    }

    bindEvents() {
        // 计算按钮事件
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculate();
        });

        // 加载示例数据按钮事件
        document.getElementById('loadExampleBtn').addEventListener('click', () => {
            this.loadExampleData();
        });

        // 输入框回车事件
        const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculate();
                }
            });
        });

        // 实时计算（可选）
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // 延迟计算，避免频繁计算
                clearTimeout(this.calcTimeout);
                this.calcTimeout = setTimeout(() => {
                    if (this.validateInputs()) {
                        this.calculate(true);
                    }
                }, 500);
            });
        });
    }

    // 加载示例数据
    loadExampleData() {
        const exampleData = {
            projectId: 'R6-2000H',
            area: 73834,
            primerThickness: 0.04,
            topcoatThickness: 0.14,
            density: 1.22,
            primerRatio: 1,
            primerRatio2: 10,
            topcoatRatio: 1,
            topcoatRatio2: 10
        };

        // 填充表单
        Object.keys(exampleData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = exampleData[key];
                // 添加动画效果
                anime({
                    targets: element,
                    scale: [1, 1.05, 1],
                    duration: 300,
                    easing: 'easeInOutQuad'
                });
            }
        });

        // 自动计算
        setTimeout(() => {
            this.calculate();
        }, 300);

        // 显示提示
        this.showToast('示例数据已加载', 'success');
    }

    // 验证输入
    validateInputs() {
        const requiredFields = ['area', 'primerThickness', 'topcoatThickness', 'density'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            const value = parseFloat(element.value);
            
            if (isNaN(value) || value <= 0) {
                element.classList.add('border-red-500');
                isValid = false;
            } else {
                element.classList.remove('border-red-500');
            }
        });

        return isValid;
    }

    // 主要计算逻辑
    calculate(isRealtime = false) {
        if (!this.validateInputs()) {
            if (!isRealtime) {
                this.showToast('请填写所有必需的数值', 'error');
            }
            return;
        }

        // 获取输入值
        const inputs = {
            projectId: document.getElementById('projectId').value || '未命名项目',
            area: parseFloat(document.getElementById('area').value),
            primerThickness: parseFloat(document.getElementById('primerThickness').value),
            topcoatThickness: parseFloat(document.getElementById('topcoatThickness').value),
            density: parseFloat(document.getElementById('density').value),
            primerRatio: parseFloat(document.getElementById('primerRatio').value),
            primerRatio2: parseFloat(document.getElementById('primerRatio2').value),
            topcoatRatio: parseFloat(document.getElementById('topcoatRatio').value),
            topcoatRatio2: parseFloat(document.getElementById('topcoatRatio2').value)
        };

        // 计算涂料重量
        const calculations = this.performCalculations(inputs);
        
        // 显示结果
        this.displayResults(calculations);
        
        // 更新图表
        this.updateChart(calculations);
        
        // 保存到历史记录（非实时计算时）
        if (!isRealtime) {
            this.addToHistory(inputs, calculations);
            this.showToast('计算完成', 'success');
        }

        // 添加计算动画
        this.animateResults();
    }

    // 执行计算
    performCalculations(inputs) {
        // 转换面积单位（平方毫米 -> 平方米）
        const areaInSqMeters = inputs.area / 1000000;
        
        // 转换厚度单位（毫米 -> 米）
        const primerThicknessInMeters = inputs.primerThickness / 1000;
        const topcoatThicknessInMeters = inputs.topcoatThickness / 1000;
        
        // 计算体积（升）
        // 1立方米 = 1000升，密度单位是kg/L，所以体积需要转换为升
        const primerVolumeInLiters = areaInSqMeters * primerThicknessInMeters * 1000;
        const topcoatVolumeInLiters = areaInSqMeters * topcoatThicknessInMeters * 1000;
        
        // 计算重量（kg）
        const primerWeight = primerVolumeInLiters * inputs.density;
        const topcoatWeight = topcoatVolumeInLiters * inputs.density;
        
        // 计算固化剂重量
        const primerCuringAgent = primerWeight * (inputs.primerRatio / (inputs.primerRatio + inputs.primerRatio2));
        const topcoatCuringAgent = topcoatWeight * (inputs.topcoatRatio / (inputs.topcoatRatio + inputs.topcoatRatio2));
        
        // 计算总重量
        const totalWeight = primerWeight + topcoatWeight + primerCuringAgent + topcoatCuringAgent;

        return {
            primerWeight: Math.round(primerWeight * 10000) / 10000,
            topcoatWeight: Math.round(topcoatWeight * 10000) / 10000,
            primerCuringAgent: Math.round(primerCuringAgent * 10000) / 10000,
            topcoatCuringAgent: Math.round(topcoatCuringAgent * 10000) / 10000,
            totalWeight: Math.round(totalWeight * 10000) / 10000
        };
    }

    // 显示结果
    displayResults(calculations) {
        document.getElementById('primerWeight').textContent = calculations.primerWeight.toFixed(4);
        document.getElementById('topcoatWeight').textContent = calculations.topcoatWeight.toFixed(4);
        document.getElementById('primerCuringAgent').textContent = calculations.primerCuringAgent.toFixed(4);
        document.getElementById('topcoatCuringAgent').textContent = calculations.topcoatCuringAgent.toFixed(4);
        document.getElementById('totalWeight').textContent = calculations.totalWeight.toFixed(4);
    }

    // 动画显示结果
    animateResults() {
        const resultElements = [
            'primerWeight', 'topcoatWeight', 'primerCuringAgent', 
            'topcoatCuringAgent', 'totalWeight'
        ];

        resultElements.forEach((id, index) => {
            const element = document.getElementById(id);
            anime({
                targets: element,
                scale: [0.8, 1.1, 1],
                opacity: [0, 1],
                duration: 600,
                delay: index * 100,
                easing: 'easeOutElastic(1, .8)'
            });
        });
    }

    // 初始化图表
    initChart() {
        const chartDom = document.getElementById('weightChart');
        this.chart = echarts.init(chartDom);
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} kg ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    fontSize: 12
                }
            },
            series: [
                {
                    name: '涂料重量分布',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['60%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '14',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        {value: 0, name: '底漆', itemStyle: {color: '#3B82F6'}},
                        {value: 0, name: '面漆', itemStyle: {color: '#10B981'}},
                        {value: 0, name: '底漆固化剂', itemStyle: {color: '#8B5CF6'}},
                        {value: 0, name: '面漆固化剂', itemStyle: {color: '#EF4444'}}
                    ]
                }
            ]
        };
        
        this.chart.setOption(option);
    }

    // 更新图表
    updateChart(calculations) {
        const option = {
            series: [
                {
                    data: [
                        {value: calculations.primerWeight, name: '底漆', itemStyle: {color: '#3B82F6'}},
                        {value: calculations.topcoatWeight, name: '面漆', itemStyle: {color: '#10B981'}},
                        {value: calculations.primerCuringAgent, name: '底漆固化剂', itemStyle: {color: '#8B5CF6'}},
                        {value: calculations.topcoatCuringAgent, name: '面漆固化剂', itemStyle: {color: '#EF4444'}}
                    ]
                }
            ]
        };
        
        this.chart.setOption(option);
        
        // 添加图表动画
        anime({
            targets: '#weightChart',
            scale: [0.9, 1],
            duration: 500,
            easing: 'easeOutQuad'
        });
    }

    // 添加到历史记录
    addToHistory(inputs, calculations) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toLocaleString('zh-CN'),
            projectId: inputs.projectId,
            area: inputs.area,
            totalWeight: calculations.totalWeight,
            calculations: calculations
        };

        this.history.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }

        this.saveHistory();
        this.renderHistory();
    }

    // 渲染历史记录
    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <p>暂无计算记录</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.history.map(item => `
            <div class="history-item bg-white rounded-lg p-4 border border-gray-200 cursor-pointer" onclick="calculator.loadHistoryItem(${item.id})">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${item.projectId}</h4>
                        <p class="text-sm text-gray-600">面积: ${item.area} mm²</p>
                        <p class="text-sm text-gray-600">总重量: ${item.totalWeight} kg</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500">${item.timestamp}</p>
                        <button onclick="event.stopPropagation(); calculator.deleteHistoryItem(${item.id})" 
                                class="text-red-500 hover:text-red-700 text-sm mt-1">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 加载历史记录项
    loadHistoryItem(id) {
        const item = this.history.find(h => h.id === id);
        if (!item) return;

        // 填充表单数据
        document.getElementById('projectId').value = item.projectId;
        document.getElementById('area').value = item.area;
        
        // 显示计算结果
        this.displayResults(item.calculations);
        this.updateChart(item.calculations);
        
        // 添加加载动画
        anime({
            targets: '#resultsArea',
            scale: [0.95, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });

        this.showToast('历史记录已加载', 'success');
    }

    // 删除历史记录项
    deleteHistoryItem(id) {
        this.history = this.history.filter(h => h.id !== id);
        this.saveHistory();
        this.renderHistory();
        this.showToast('记录已删除', 'success');
    }

    // 保存历史记录到本地存储
    saveHistory() {
        localStorage.setItem('paintCalculatorHistory', JSON.stringify(this.history));
    }

    // 加载历史记录
    loadHistory() {
        const saved = localStorage.getItem('paintCalculatorHistory');
        return saved ? JSON.parse(saved) : [];
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = `fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // 隐藏动画
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// 初始化计算器
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new PaintCalculator();
});

// 响应式图表
window.addEventListener('resize', () => {
    if (calculator && calculator.chart) {
        calculator.chart.resize();
    }
});