function Validator(formSlector){
    var _this = this
    
    var formRules = {}
    // Lấy ra thẻ cha
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    /**
     * Quy ước tạo rules:
     * - Nếu có lỗi return ra "error mesage"
     * - Nếu không lỗi return ra "undefined"
     */
    var validatorRules = {
        repuired : function(value){
            return value ? undefined : "Vui lòng nhập trường này"
        },
        email : function(value){
            var regex =/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            return regex.test(value) ? undefined : "Trường này phải là email"
        },
        phone : function(value){
            var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
            return vnf_regex.test(value) ? undefined : "Số điện thoại không hợp lệ"
        },
        min : function(min){
            return function(value){
                return value.length >= min? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
            }
        },
        max : function(max){
            return function(value){
                return value.length <= max? undefined : `Vui lòng nhập tối đa  ${max} ký tự`
            }
        }
    }

    

    // Lấy ra form element trong DOM theo formSlector
    var formElement = document.querySelector(formSlector);

    // Chỉ xử lý khi có element
    if(formElement){
        
        var inputs = formElement.querySelectorAll("input[name][rules]")
        for(var input of inputs){

            var rules = input.getAttribute("rules").split("|")
            for(var rule of rules ){

                var ruleInfo 
                var isRuleHasValue = rule.includes(":")
                if(isRuleHasValue){
                    ruleInfo = rule.split(":");

                    rule = ruleInfo[0];

                }
                var ruleFunc = validatorRules[rule]

                if(isRuleHasValue){
                    ruleFunc = ruleFunc(ruleInfo[1])
                }
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc)
                }
                else{
                    formRules[input.name] = [ruleFunc]
                }

            }

            // Lắng nghe sự kiện (blur , change)
            input.onblur = handleValidate
            input.oninput = handleClearError

        }

        // Hàm thực hiện validate
        function handleValidate(even){
            var rules = formRules[even.target.name]

            var errorMessage 
            for(var rule of rules){
                errorMessage = rule(even.target.value)
                if(errorMessage) break
            }

            // Nếu có lỗi thì hiển thị message lỗi ra web
            var formGroup = getParent(even.target, '.form-group')
            if(errorMessage){
                if(formGroup){
                    var errorElement = formGroup.querySelector('.form-message')
                    if(errorElement){
                        formGroup.classList.add('invalid')
                        errorElement.innerText = errorMessage
                    }
                }
            }else{
                formGroup.classList.remove('invalid')
                var errorElement = formGroup.querySelector('.form-message')
                errorElement.innerText = ''
            }
            return !errorMessage
        }

        // Hàm thực hiện handle Clear Error
        function handleClearError(even){
            var formGroup = getParent(even.target, '.form-group')
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid')
            }
            var errorElement = formGroup.querySelector('.form-message')
            var errorMessage = errorElement.innerText
            if(errorMessage != ""){
                errorElement.innerText = ''
            }
        }
    }


    // Xử hành vi submit form
    formElement.onsubmit = function(even){
        even.preventDefault()
        var inputs = formElement.querySelectorAll("input[name][rules]")
        var isValid = true
        
        for(var input of inputs){
            if(!handleValidate({target : input})){
                isValid = false
            }
        }

        // Nếu không có lỗi thì submit form
        if(isValid){
            if(typeof _this.onSubmit === 'function'){

                 var enableInput = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInput).reduce(function(values, input){

                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] = ''
                                    return values
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)

                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }

                        return  values
                    }, {})

                    _this.onSubmit(formValues)
                
            }else{
                // formElement.submit()
                console.log(12313)
            }
        }
    }
}