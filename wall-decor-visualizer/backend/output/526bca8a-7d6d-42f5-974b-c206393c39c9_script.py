OUTPUT_PATH = '/tmp/526bca8a-7d6d-42f5-974b-c206393c39c9.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Total Width: 7' + 7'6" = 14.5'
    Total Height: 9'
    Opening (Door/Window): 7' wide by 8' high, located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor: 1 foot = 0.3048 meters
    ft_to_m = 0.3048

    # Wall dimensions
    wall_w = 14.5 * ft_to_m
    wall_h = 9.0 * ft_to_m
    wall_d = 0.15  # Standard wall thickness (~6 inches)

    # Opening dimensions
    opening_w = 7.0 * ft_to_m
    opening_h = 8.0 * ft_to_m

    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.dimensions = (wall_w, wall_h, wall_d)
    # Position so the bottom-left corner is at the origin (0,0,0)
    wall.location = (wall_w / 2, wall_h / 2, wall_d / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening Cutter
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    # Make cutter slightly deeper to ensure a clean boolean cut
    cutter.dimensions = (opening_w, opening_h, wall_d * 2)
    # Position at the bottom-left of the wall
    cutter.location = (opening_w / 2, opening_h / 2, wall_d / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Operation
    boolean_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    boolean_mod.object = cutter
    boolean_mod.operation = 'DIFFERENCE'
    
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=boolean_mod.name)

    # 4. Clean up: Remove the cutter object
    bpy.data.objects.remove(cutter, do_unlink=True)

    # 5. Export to GLB
    # filepath is set to 'wall_skeleton.glb' in the current working directory
    bpy.ops.export_scene.gltf(
        filepath='/tmp/526bca8a-7d6d-42f5-974b-c206393c39c9.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()