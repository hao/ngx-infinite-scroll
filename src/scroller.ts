import { ElementRef } from '@angular/core';

export class Scroller {
	public scrollDistance: number;
	public scrollEnabled: boolean;
	public checkWhenEnabled: boolean;
	public container: any;
	public immediateCheck: boolean;
	public useDocumentBottom: boolean;
	public checkInterval: any;
	public windowElement: Window;
	public infiniteScrollCallback: Function;
	public $interval: any;
	public $elementRef: ElementRef;
	private bindedHandler: Function;

	constructor(
		$window: Window,
		$interval: any,
		$elementRef: ElementRef,
		infiniteScrollCallback: Function,
		infiniteScrollDistance: number,
		infiniteScrollParent: any
		) {
		let THROTTLE_MILLISECONDS = 300;
		this.windowElement = $window;
		this.infiniteScrollCallback = infiniteScrollCallback;
		this.$interval = $interval;
		this.$elementRef = $elementRef;

		if (THROTTLE_MILLISECONDS != null) {
			this.handler = this.throttle(this.handler, THROTTLE_MILLISECONDS);
		}
		this.handleInfiniteScrollDistance(infiniteScrollDistance);

		// if (attrs.infiniteScrollParent != null) {
		// 	changeContainer(angular.element(elem.parent()));
		// }
		// if (attrs.infiniteScrollImmediateCheck != null) {
		// 	immediateCheck = scope.$eval(attrs.infiniteScrollImmediateCheck);
		// }
		let _self = this;
		this.handleInfiniteScrollDisabled(false);
		this.changeContainer(_self.windowElement);
		this.checkInterval = setInterval((function() {
			if (_self.immediateCheck) {
				return _self.handler();
			}
		}), 0);
	}

	height (elem) {
		// elem = elem.nativeElement;
		if (isNaN(elem.offsetHeight)) {
			return elem.document.documentElement.clientHeight;
		} else {
			return elem.offsetHeight;
		}
	}

	offsetTop (elem) {
		// elem = elem.nativeElement;
		if (!elem.getBoundingClientRect) { // || elem.css('none')) {
			return;
		}
		return elem.getBoundingClientRect().top + this.pageYOffset(elem);
	}

	pageYOffset (elem) {
		// elem = elem.nativeElement;
		if (isNaN(window.pageYOffset)) {
			return elem.document.documentElement.scrollTop;
		} else {
			return elem.ownerDocument.defaultView.pageYOffset;
		}
	}

	handler () {
		var containerBottom: number, containerTopOffset: number, elementBottom: number, remaining: number, shouldScroll: boolean;
		if (this.container === this.windowElement) {
			containerBottom = this.height(this.container) + this.pageYOffset(this.container.document.documentElement);
			elementBottom = this.offsetTop(this.$elementRef.nativeElement) + this.height(this.$elementRef.nativeElement);
		} else {
			containerBottom = this.height(this.container);
			containerTopOffset = 0;
			if (this.offsetTop(this.container) !== void 0) {
				containerTopOffset = this.offsetTop(this.container);
			}
			elementBottom = this.offsetTop(this.$elementRef.nativeElement) - containerTopOffset + this.height(this.$elementRef.nativeElement);
		}
		if (this.useDocumentBottom) {
			elementBottom = this.height((this.$elementRef.nativeElement.ownerDocument || this.$elementRef.nativeElement.document).documentElement);
		}
		remaining = elementBottom - containerBottom;
		shouldScroll = remaining <= this.height(this.container) * this.scrollDistance + 1;
		if (shouldScroll) {
			this.checkWhenEnabled = true;
			if (this.scrollEnabled) {
				// if (scope.$$phase || $rootScope.$$phase) {
				// 	return scope.infiniteScroll();
				// } else {
				// 	return scope.$apply(scope.infiniteScroll);
				// }
				this.infiniteScrollCallback();
			}
		} else {
			if (this.checkInterval) {
				// this.$interval.cancel(this.checkInterval);
				clearInterval(this.checkInterval);
			}
			return this.checkWhenEnabled = false;
		}
	}

	throttle (func: Function, wait: number) {
		var later: Function, previous: number, timeout: number;
		var _self = this;
		timeout = null;
		previous = 0;
		later = function() {
			previous = new Date().getTime();
			clearInterval(timeout);
			timeout = null;
			func.call(_self);
		};
		return function() {
			var now: number, remaining: number;
			now = new Date().getTime();
			remaining = wait - (now - previous);
			if (remaining <= 0) {
				clearTimeout(timeout);
				clearInterval(timeout);
				timeout = null;
				previous = now;
				return func.call(_self);
			} else {
				if (!timeout) {
					return timeout = _self.$interval(later, remaining, 1);
				}
			}
		};
	}

	handleInfiniteScrollDistance (v) {
		return this.scrollDistance = parseFloat(v) || 0;
	}

	changeContainer (newContainer: Window) {
		this.clean();
		this.container = newContainer;
		if (newContainer != null) {
			this.bindedHandler = this.handler.bind(this);
            return this.container.addEventListener('scroll', this.bindedHandler);
		}
	}

	clean () {
		if (this.container !== undefined) {
            this.container.removeEventListener('scroll', this.bindedHandler);
            this.bindedHandler = null;
		}
	}

	handleInfiniteScrollDisabled (v: boolean) {
		this.scrollEnabled = !v;
		// if (this.scrollEnabled && checkWhenEnabled) {
		// 	checkWhenEnabled = false;
		// 	return handler();
		// }
	}
}