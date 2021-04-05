varying vec2 vUv;
uniform sampler2D previous_texture;
uniform vec2 brush;
uniform float brush_size;
uniform vec2 screen_size;
uniform float killrate_min;
uniform float killrate_max;
uniform float feedrate;
uniform float difussion_a;
uniform float difussion_b;


void main(){
    vec2 step = vec2(1.,1.)/screen_size;

    vec2 uv0 = texture2D(previous_texture, vUv + vec2(-step.x, -step.y)).rg * 0.05;
    vec2 uv1 = texture2D(previous_texture, vUv + vec2( 0., -step.y)).rg * 0.2;
    vec2 uv2 = texture2D(previous_texture, vUv + vec2(step.x, -step.y)).rg * 0.05;

    vec2 uv3 = texture2D(previous_texture, vUv + vec2(-step.x, 0.)).rg * 0.2;
    vec2 uv4 = texture2D(previous_texture, vUv).rg * (0.-1.);
    vec2 uv5 = texture2D(previous_texture, vUv + vec2(step.x, 0.)).rg * 0.2;

    vec2 uv6 = texture2D(previous_texture, vUv + vec2(-step.x, step.y)).rg * 0.05;
    vec2 uv7 = texture2D(previous_texture, vUv + vec2( 0., step.y)).rg * 0.2;
    vec2 uv8 = texture2D(previous_texture, vUv + vec2(step.x, step.y)).rg * 0.05;
    
    vec2 laplacian = uv0 + uv1 + uv2 + uv3 + uv4 + uv5 + uv6 + uv7 + uv8;
    vec2 uv = texture2D(previous_texture, vUv).rg;
    float killrate = (vUv.x * (killrate_max-killrate_min)) + killrate_min;
    float a = uv.r + 1. * ((laplacian.r * difussion_a) - (uv.r*uv.g*uv.g) + (feedrate * (1. - uv.r)));
    float b = uv.g + 1. * ((laplacian.g * difussion_b) + (uv.r*uv.g*uv.g) - ((feedrate + killrate) * uv.g));


    gl_FragColor =  vec4(clamp(a,0.,1.), clamp(b,0.,1.),0. ,1.);

    if(brush.x > 0.0){
        vec2 diff = (vUv - brush) * screen_size;
        float dist = dot(diff, diff);
        if(dist < brush_size)
            gl_FragColor = vec4(0.,1.,0.,1.);
    }

    
}
