import { InputManager } from "./input.manager";
export class InputService {
    constructor(htmlInputElement, options) {
        this.htmlInputElement = htmlInputElement;
        this.options = options;
        this.inputManager = new InputManager(htmlInputElement);
    }
    addNumber(keyCode) {
        if (!this.rawValue) {
            this.rawValue = this.applyMask(false, "0");
        }
        let keyChar = String.fromCharCode(keyCode);
        let selectionStart = this.inputSelection.selectionStart;
        let selectionEnd = this.inputSelection.selectionEnd;
        this.rawValue = this.rawValue.substring(0, selectionStart) + keyChar + this.rawValue.substring(selectionEnd, this.rawValue.length);
        this.updateFieldValue(selectionStart + 1);
    }
    applyMask(isNumber, rawValue) {
        let { allowNegative, decimal, precision, prefix, suffix, thousands } = this.options;
        rawValue = isNumber ? new Number(rawValue).toFixed(precision) : rawValue;
        let onlyNumbers = rawValue.replace(/[^0-9]/g, "");
        if (!onlyNumbers) {
            return "";
        }
        let integerPart = onlyNumbers.slice(0, onlyNumbers.length - precision).replace(/^0*/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
        if (integerPart == "") {
            integerPart = "0";
        }
        let newRawValue = integerPart;
        let decimalPart = onlyNumbers.slice(onlyNumbers.length - precision);
        if (precision > 0) {
            decimalPart = "0".repeat(precision - decimalPart.length) + decimalPart;
            newRawValue += decimal + decimalPart;
        }
        let isZero = parseInt(integerPart) == 0 && (parseInt(decimalPart) == 0 || decimalPart == "");
        let operator = (rawValue.indexOf("-") > -1 && allowNegative && !isZero) ? "-" : "";
        return operator + prefix + newRawValue + suffix;
    }
    clearMask(rawValue) {
        if (rawValue == null || rawValue == "") {
            return null;
        }
        let value = rawValue.replace(this.options.prefix, "").replace(this.options.suffix, "");
        if (this.options.thousands) {
            value = value.replace(new RegExp("\\" + this.options.thousands, "g"), "");
        }
        if (this.options.decimal) {
            value = value.replace(this.options.decimal, ".");
        }
        return parseFloat(value);
    }
    changeToNegative() {
        if (this.options.allowNegative && this.rawValue != "" && this.rawValue.charAt(0) != "-" && this.value != 0) {
            let selectionStart = this.inputSelection.selectionStart;
            this.rawValue = "-" + this.rawValue;
            this.updateFieldValue(selectionStart + 1);
        }
    }
    changeToPositive() {
        let selectionStart = this.inputSelection.selectionStart;
        this.rawValue = this.rawValue.replace("-", "");
        this.updateFieldValue(selectionStart - 1);
    }
    fixCursorPosition(forceToEndPosition) {
        let currentCursorPosition = this.inputSelection.selectionStart;
        //if the current cursor position is after the number end position, it is moved to the end of the number, ignoring the prefix or suffix. this behavior can be forced with forceToEndPosition flag
        if (currentCursorPosition > this.getRawValueWithoutSuffixEndPosition() || forceToEndPosition) {
            this.inputManager.setCursorAt(this.getRawValueWithoutSuffixEndPosition());
            //if the current cursor position is before the number start position, it is moved to the start of the number, ignoring the prefix or suffix
        }
        else if (currentCursorPosition < this.getRawValueWithoutPrefixStartPosition()) {
            this.inputManager.setCursorAt(this.getRawValueWithoutPrefixStartPosition());
        }
    }
    getRawValueWithoutSuffixEndPosition() {
        return this.rawValue.length - this.options.suffix.length;
    }
    getRawValueWithoutPrefixStartPosition() {
        return this.value != null && this.value < 0 ? this.options.prefix.length + 1 : this.options.prefix.length;
    }
    removeNumber(keyCode) {
        let { decimal, thousands } = this.options;
        let selectionEnd = this.inputSelection.selectionEnd;
        let selectionStart = this.inputSelection.selectionStart;
        if (selectionStart > this.rawValue.length - this.options.suffix.length) {
            selectionEnd = this.rawValue.length - this.options.suffix.length;
            selectionStart = this.rawValue.length - this.options.suffix.length;
        }
        //there is no selection
        if (selectionEnd == selectionStart) {
            //delete key and the target digit is a number
            if ((keyCode == 46 || keyCode == 63272) && /^\d+$/.test(this.rawValue.substring(selectionStart, selectionEnd + 1))) {
                selectionEnd = selectionEnd + 1;
            }
            //delete key and the target digit is the decimal or thousands divider
            if ((keyCode == 46 || keyCode == 63272) && (this.rawValue.substring(selectionStart, selectionEnd + 1) == decimal || this.rawValue.substring(selectionStart, selectionEnd + 1) == thousands)) {
                selectionEnd = selectionEnd + 2;
                selectionStart = selectionStart + 1;
            }
            //backspace key and the target digit is a number
            if (keyCode == 8 && /^\d+$/.test(this.rawValue.substring(selectionStart - 1, selectionEnd))) {
                selectionStart = selectionStart - 1;
            }
            //backspace key and the target digit is the decimal or thousands divider
            if (keyCode == 8 && (this.rawValue.substring(selectionStart - 1, selectionEnd) == decimal || this.rawValue.substring(selectionStart - 1, selectionEnd) == thousands)) {
                selectionStart = selectionStart - 2;
                selectionEnd = selectionEnd - 1;
            }
        }
        this.rawValue = this.rawValue.substring(0, selectionStart) + this.rawValue.substring(selectionEnd, this.rawValue.length);
        this.updateFieldValue(selectionStart);
    }
    updateFieldValue(selectionStart) {
        let newRawValue = this.applyMask(false, this.rawValue || "");
        selectionStart = selectionStart == undefined ? this.rawValue.length : selectionStart;
        this.inputManager.updateValueAndCursor(newRawValue, this.rawValue.length, selectionStart);
    }
    updateOptions(options) {
        let value = this.value;
        this.options = options;
        this.value = value;
    }
    get canInputMoreNumbers() {
        return this.inputManager.canInputMoreNumbers;
    }
    get inputSelection() {
        return this.inputManager.inputSelection;
    }
    get rawValue() {
        return this.inputManager.rawValue;
    }
    set rawValue(value) {
        this.inputManager.rawValue = value;
    }
    get storedRawValue() {
        return this.inputManager.storedRawValue;
    }
    get value() {
        return this.clearMask(this.rawValue);
    }
    set value(value) {
        this.rawValue = this.applyMask(true, "" + value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2N1cnJlbmN5LW1hc2svc3JjL2xpYi9pbnB1dC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxNQUFNLE9BQU8sWUFBWTtJQUlyQixZQUFvQixnQkFBcUIsRUFBVSxPQUFZO1FBQTNDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBSztRQUFVLFlBQU8sR0FBUCxPQUFPLENBQUs7UUFDM0QsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxTQUFTLENBQUMsT0FBZTtRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzlDO1FBRUQsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQztRQUN4RCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQztRQUNwRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkksSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsU0FBUyxD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SSxjQUFjO1FBQ2QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsS0FBYTtRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbnB1dE1hbmFnZXIgfSBmcm9tIFwiLi9pbnB1dC5tYW5hZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBJbnB1dFNlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSBpbnB1dE1hbmFnZXI6IElucHV0TWFuYWdlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaHRtbElucHV0RWxlbWVudDogYW55LCBwcml2YXRlIG9wdGlvbnM6IGFueSkge1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlciA9IG5ldyBJbnB1dE1hbmFnZXIoaHRtbElucHV0RWxlbWVudCk7XG4gICAgfVxuXG4gICAgYWRkTnVtYmVyKGtleUNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMucmF3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMucmF3VmFsdWUgPSB0aGlzLmFwcGx5TWFzayhmYWxzZSwgXCIwXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGtleUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUpO1xuICAgICAgICBsZXQgc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgICBsZXQgc2VsZWN0aW9uRW5kID0gdGhpcy5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25FbmQ7XG4gICAgICAgIHRoaXMucmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlLnN1YnN0cmluZygwLCBzZWxlY3Rpb25TdGFydCkgKyBrZXlDaGFyICsgdGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcoc2VsZWN0aW9uRW5kLCB0aGlzLnJhd1ZhbHVlLmxlbmd0aCk7XG4gICAgICAgIHRoaXMudXBkYXRlRmllbGRWYWx1ZShzZWxlY3Rpb25TdGFydCArIDEpO1xuICAgIH1cblxuICAgIGFwcGx5TWFzayhpc051bWJlcjogYm9vbGVhbiwgcmF3VmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGxldCB7IGFsbG93TmVnYXRpdmUsIGRlY2ltYWwsIHByZWNpc2lvbiwgcHJlZml4LCBzdWZmaXgsIHRob3VzYW5kcyB9ID0gdGhpcy5vcHRpb25zO1xuICAgICAgICByYXdWYWx1ZSA9IGlzTnVtYmVyID8gbmV3IE51bWJlcihyYXdWYWx1ZSkudG9GaXhlZChwcmVjaXNpb24pIDogcmF3VmFsdWU7XG4gICAgICAgIGxldCBvbmx5TnVtYmVycyA9IHJhd1ZhbHVlLnJlcGxhY2UoL1teMC05XS9nLCBcIlwiKTtcblxuICAgICAgICBpZiAoIW9ubHlOdW1iZXJzKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbnRlZ2VyUGFydCA9IG9ubHlOdW1iZXJzLnNsaWNlKDAsIG9ubHlOdW1iZXJzLmxlbmd0aCAtIHByZWNpc2lvbikucmVwbGFjZSgvXjAqL2csIFwiXCIpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIHRob3VzYW5kcyk7XG5cbiAgICAgICAgaWYgKGludGVnZXJQYXJ0ID09IFwiXCIpIHtcbiAgICAgICAgICAgIGludGVnZXJQYXJ0ID0gXCIwXCI7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3UmF3VmFsdWUgPSBpbnRlZ2VyUGFydDtcbiAgICAgICAgbGV0IGRlY2ltYWxQYXJ0ID0gb25seU51bWJlcnMuc2xpY2Uob25seU51bWJlcnMubGVuZ3RoIC0gcHJlY2lzaW9uKTtcblxuICAgICAgICBpZiAocHJlY2lzaW9uID4gMCkge1xuICAgICAgICAgICAgZGVjaW1hbFBhcnQgPSBcIjBcIi5yZXBlYXQocHJlY2lzaW9uIC0gZGVjaW1hbFBhcnQubGVuZ3RoKSArIGRlY2ltYWxQYXJ0O1xuICAgICAgICAgICAgbmV3UmF3VmFsdWUgKz0gZGVjaW1hbCArIGRlY2ltYWxQYXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGlzWmVybyA9IHBhcnNlSW50KGludGVnZXJQYXJ0KSA9PSAwICYmIChwYXJzZUludChkZWNpbWFsUGFydCkgPT0gMCB8fCBkZWNpbWFsUGFydCA9PSBcIlwiKTtcbiAgICAgICAgbGV0IG9wZXJhdG9yID0gKHJhd1ZhbHVlLmluZGV4T2YoXCItXCIpID4gLTEgJiYgYWxsb3dOZWdhdGl2ZSAmJiAhaXNaZXJvKSA/IFwiLVwiIDogXCJcIjtcbiAgICAgICAgcmV0dXJuIG9wZXJhdG9yICsgcHJlZml4ICsgbmV3UmF3VmFsdWUgKyBzdWZmaXg7XG4gICAgfVxuXG4gICAgY2xlYXJNYXNrKHJhd1ZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBpZiAocmF3VmFsdWUgPT0gbnVsbCB8fCByYXdWYWx1ZSA9PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2YWx1ZSA9IHJhd1ZhbHVlLnJlcGxhY2UodGhpcy5vcHRpb25zLnByZWZpeCwgXCJcIikucmVwbGFjZSh0aGlzLm9wdGlvbnMuc3VmZml4LCBcIlwiKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRob3VzYW5kcykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKG5ldyBSZWdFeHAoXCJcXFxcXCIgKyB0aGlzLm9wdGlvbnMudGhvdXNhbmRzLCBcImdcIiksIFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWNpbWFsKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UodGhpcy5vcHRpb25zLmRlY2ltYWwsIFwiLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VUb05lZ2F0aXZlKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsbG93TmVnYXRpdmUgJiYgdGhpcy5yYXdWYWx1ZSAhPSBcIlwiICYmIHRoaXMucmF3VmFsdWUuY2hhckF0KDApICE9IFwiLVwiICYmIHRoaXMudmFsdWUgIT0gMCkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGlvblN0YXJ0ID0gdGhpcy5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgICAgIHRoaXMucmF3VmFsdWUgPSBcIi1cIiArIHRoaXMucmF3VmFsdWU7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQgKyAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZVRvUG9zaXRpdmUoKTogdm9pZCB7XG4gICAgICAgIGxldCBzZWxlY3Rpb25TdGFydCA9IHRoaXMuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uU3RhcnQ7XG4gICAgICAgIHRoaXMucmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlLnJlcGxhY2UoXCItXCIsIFwiXCIpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQgLSAxKTtcbiAgICB9XG5cbiAgICBmaXhDdXJzb3JQb3NpdGlvbihmb3JjZVRvRW5kUG9zaXRpb24/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGxldCBjdXJyZW50Q3Vyc29yUG9zaXRpb24gPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvblN0YXJ0O1xuXG4gICAgICAgIC8vaWYgdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBudW1iZXIgZW5kIHBvc2l0aW9uLCBpdCBpcyBtb3ZlZCB0byB0aGUgZW5kIG9mIHRoZSBudW1iZXIsIGlnbm9yaW5nIHRoZSBwcmVmaXggb3Igc3VmZml4LiB0aGlzIGJlaGF2aW9yIGNhbiBiZSBmb3JjZWQgd2l0aCBmb3JjZVRvRW5kUG9zaXRpb24gZmxhZ1xuICAgICAgICBpZiAoY3VycmVudEN1cnNvclBvc2l0aW9uID4gdGhpcy5nZXRSYXdWYWx1ZVdpdGhvdXRTdWZmaXhFbmRQb3NpdGlvbigpIHx8IGZvcmNlVG9FbmRQb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIuc2V0Q3Vyc29yQXQodGhpcy5nZXRSYXdWYWx1ZVdpdGhvdXRTdWZmaXhFbmRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgIC8vaWYgdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uIGlzIGJlZm9yZSB0aGUgbnVtYmVyIHN0YXJ0IHBvc2l0aW9uLCBpdCBpcyBtb3ZlZCB0byB0aGUgc3RhcnQgb2YgdGhlIG51bWJlciwgaWdub3JpbmcgdGhlIHByZWZpeCBvciBzdWZmaXhcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50Q3Vyc29yUG9zaXRpb24gPCB0aGlzLmdldFJhd1ZhbHVlV2l0aG91dFByZWZpeFN0YXJ0UG9zaXRpb24oKSkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIuc2V0Q3Vyc29yQXQodGhpcy5nZXRSYXdWYWx1ZVdpdGhvdXRQcmVmaXhTdGFydFBvc2l0aW9uKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UmF3VmFsdWVXaXRob3V0U3VmZml4RW5kUG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmF3VmFsdWUubGVuZ3RoIC0gdGhpcy5vcHRpb25zLnN1ZmZpeC5sZW5ndGg7XG4gICAgfVxuXG4gICAgZ2V0UmF3VmFsdWVXaXRob3V0UHJlZml4U3RhcnRQb3NpdGlvbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSAhPSBudWxsICYmIHRoaXMudmFsdWUgPCAwID8gdGhpcy5vcHRpb25zLnByZWZpeC5sZW5ndGggKyAxIDogdGhpcy5vcHRpb25zLnByZWZpeC5sZW5ndGg7XG4gICAgfVxuXG4gICAgcmVtb3ZlTnVtYmVyKGtleUNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgeyBkZWNpbWFsLCB0aG91c2FuZHMgfSA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgbGV0IHNlbGVjdGlvbkVuZCA9IHRoaXMuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uRW5kO1xuICAgICAgICBsZXQgc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvblN0YXJ0O1xuXG4gICAgICAgIGlmIChzZWxlY3Rpb25TdGFydCA+IHRoaXMucmF3VmFsdWUubGVuZ3RoIC0gdGhpcy5vcHRpb25zLnN1ZmZpeC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbkVuZCA9IHRoaXMucmF3VmFsdWUubGVuZ3RoIC0gdGhpcy5vcHRpb25zLnN1ZmZpeC5sZW5ndGg7XG4gICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoaXMucmF3VmFsdWUubGVuZ3RoIC0gdGhpcy5vcHRpb25zLnN1ZmZpeC5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICAvL3RoZXJlIGlzIG5vIHNlbGVjdGlvblxuICAgICAgICBpZiAoc2VsZWN0aW9uRW5kID09IHNlbGVjdGlvblN0YXJ0KSB7XG4gICAgICAgICAgICAvL2RlbGV0ZSBrZXkgYW5kIHRoZSB0YXJnZXQgZGlnaXQgaXMgYSBudW1iZXJcbiAgICAgICAgICAgIGlmICgoa2V5Q29kZSA9PSA0NiB8fCBrZXlDb2RlID09IDYzMjcyKSAmJiAvXlxcZCskLy50ZXN0KHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQgKyAxKSkpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25FbmQgKyAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2RlbGV0ZSBrZXkgYW5kIHRoZSB0YXJnZXQgZGlnaXQgaXMgdGhlIGRlY2ltYWwgb3IgdGhvdXNhbmRzIGRpdmlkZXJcbiAgICAgICAgICAgIGlmICgoa2V5Q29kZSA9PSA0NiB8fCBrZXlDb2RlID09IDYzMjcyKSAmJiAodGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcoc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCArIDEpID09IGRlY2ltYWwgfHwgdGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcoc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCArIDEpID09IHRob3VzYW5kcykpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25FbmQgKyAyO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvblN0YXJ0ID0gc2VsZWN0aW9uU3RhcnQgKyAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2JhY2tzcGFjZSBrZXkgYW5kIHRoZSB0YXJnZXQgZGlnaXQgaXMgYSBudW1iZXJcbiAgICAgICAgICAgIGlmIChrZXlDb2RlID09IDggJiYgL15cXGQrJC8udGVzdCh0aGlzLnJhd1ZhbHVlLnN1YnN0cmluZyhzZWxlY3Rpb25TdGFydCAtIDEsIHNlbGVjdGlvbkVuZCkpKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25TdGFydCAtIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vYmFja3NwYWNlIGtleSBhbmQgdGhlIHRhcmdldCBkaWdpdCBpcyB0aGUgZGVjaW1hbCBvciB0aG91c2FuZHMgZGl2aWRlclxuICAgICAgICAgICAgaWYgKGtleUNvZGUgPT0gOCAmJiAodGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcoc2VsZWN0aW9uU3RhcnQgLSAxLCBzZWxlY3Rpb25FbmQpID09IGRlY2ltYWwgfHwgdGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcoc2VsZWN0aW9uU3RhcnQgLSAxLCBzZWxlY3Rpb25FbmQpID09IHRob3VzYW5kcykpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvblN0YXJ0IC0gMjtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25FbmQgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yYXdWYWx1ZSA9IHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKDAsIHNlbGVjdGlvblN0YXJ0KSArIHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKHNlbGVjdGlvbkVuZCwgdGhpcy5yYXdWYWx1ZS5sZW5ndGgpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQpO1xuICAgIH1cblxuICAgIHVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IG5ld1Jhd1ZhbHVlID0gdGhpcy5hcHBseU1hc2soZmFsc2UsIHRoaXMucmF3VmFsdWUgfHwgXCJcIik7XG4gICAgICAgIHNlbGVjdGlvblN0YXJ0ID0gc2VsZWN0aW9uU3RhcnQgPT0gdW5kZWZpbmVkID8gdGhpcy5yYXdWYWx1ZS5sZW5ndGggOiBzZWxlY3Rpb25TdGFydDtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIudXBkYXRlVmFsdWVBbmRDdXJzb3IobmV3UmF3VmFsdWUsIHRoaXMucmF3VmFsdWUubGVuZ3RoLCBzZWxlY3Rpb25TdGFydCk7XG4gICAgfVxuXG4gICAgdXBkYXRlT3B0aW9ucyhvcHRpb25zOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXIgPSB0aGlzLnZhbHVlO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGNhbklucHV0TW9yZU51bWJlcnMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5jYW5JbnB1dE1vcmVOdW1iZXJzO1xuICAgIH1cblxuICAgIGdldCBpbnB1dFNlbGVjdGlvbigpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuaW5wdXRTZWxlY3Rpb247XG4gICAgfVxuXG4gICAgZ2V0IHJhd1ZhbHVlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5yYXdWYWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgcmF3VmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlci5yYXdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCBzdG9yZWRSYXdWYWx1ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuc3RvcmVkUmF3VmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHZhbHVlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmNsZWFyTWFzayh0aGlzLnJhd1ZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXQgdmFsdWUodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLnJhd1ZhbHVlID0gdGhpcy5hcHBseU1hc2sodHJ1ZSwgXCJcIiArIHZhbHVlKTtcbiAgICB9XG59Il19