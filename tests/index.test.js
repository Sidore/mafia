import Vue from 'vue';
import vuex from "vuex";
import App from '../src/components/Users.vue'

describe('App.test.js', () => {
  let cmp, vm;

  beforeEach(() => {
    //   Vue.use(vuex);
    cmp = Vue.extend(App) 
    // Create a copy of the original component
    vm = new cmp({
      data: { // Replace data value with this fake data
        messages: ['Cat'],
        $store : {
            state : {}
        }
      },
      
    }).$mount() // Instances and mounts the component
  })

  it('equals messages to ["Cat"]', () => {
    expect(vm.messages).toEqual(['Cat'])
  })
})
